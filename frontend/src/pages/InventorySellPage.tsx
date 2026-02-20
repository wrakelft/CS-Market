import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";
import { Link } from "react-router-dom";

type InventoryItem = {
    id: number;
    ownershipFlag: string;
    receivedAt: string;
    tradable: boolean;
    skinId: number;
    skinName: string;
    collection: string;
    rarity: string;
    condition: string;
};

type SaleListingCreated = {
    id: number;
    price: number;
    status: string;
    inventoryItemId: number;
};

type InstantPriceResponse = {
    price: number;
};

type CreateRentalListingRequest = {
    ownerId: number;
    inventoryItemId: number;
    pricePerDay: number;
    maxDays: number;
};

type RentalListingCreated = {
    listingId: number;
    pricePerDay: number;
    maxDays: number;
    skinId: number;
    skinName: string;
    ownerId: number;
};

export default function InventorySellPage() {
    const { user } = useAuth();
    const userId = user?.id ?? 0;

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [priceById, setPriceById] = useState<Record<number, string>>({});
    const [creatingId, setCreatingId] = useState<number | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [rentPriceById, setRentPriceById] = useState<Record<number, string>>({});
    const [rentDaysById, setRentDaysById] = useState<Record<number, string>>({});
    const [creatingRentId, setCreatingRentId] = useState<number | null>(null);
    const [rentMsg, setRentMsg] = useState<string | null>(null);

    const [totalValue, setTotalValue] = useState<number | null>(null);
    const [missingPrices, setMissingPrices] = useState<number>(0);

    const load = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await api.get<InventoryItem[]>(`/users/${userId}/inventory`);
            const arr = data ?? [];
            setItems(arr);
            void recalcTotal(arr);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const tradableCount = useMemo(() => items.filter((x) => x.tradable).length, [items]);

    const parsePosInt = (v: string) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return null;
        const i = Math.floor(n);
        return i > 0 ? i : null;
    };

    async function recalcTotal(itemsNow: InventoryItem[]) {
        if (!itemsNow.length) {
            setTotalValue(0);
            setMissingPrices(0);
            return;
        }

        const skinIds = Array.from(new Set(itemsNow.map((x) => x.skinId)));

        let missing = 0;
        const priceBySkin: Record<number, number> = {};

        await Promise.all(
            skinIds.map(async (sid) => {
                try {
                    // бэк возвращает Integer => fetcher api.get может вернуть number
                    // но если у тебя обёртка всегда делает {price}, оставь как было.
                    // Ниже вариант под {price:number}. Если у тебя number — замени на api.get<number>(...) и p = resp
                    const resp = await api.get<{ price: number }>(`/market/skins/${sid}/instant-price`);
                    const p = resp?.price;
                    if (p && p > 0) priceBySkin[sid] = p;
                    else missing++;
                } catch {
                    missing++;
                }
            })
        );

        let sum = 0;
        for (const it of itemsNow) {
            const p = priceBySkin[it.skinId];
            if (p) sum += p;
        }

        setMissingPrices(missing);
        setTotalValue(sum);
    }

    async function createRentListing(item: InventoryItem) {
        if (!userId) return;

        const pricePerDay = parsePosInt(rentPriceById[item.id] ?? "");
        const maxDays = parsePosInt(rentDaysById[item.id] ?? "");

        if (!pricePerDay || !maxDays) {
            setRentMsg("Заполни price/day и maxDays (оба > 0).");
            return;
        }

        setCreatingRentId(item.id);
        setRentMsg(null);

        try {
            const created = await api.post<RentalListingCreated>(
                "/listings/rent",
                {
                    ownerId: userId,
                    inventoryItemId: item.id,
                    pricePerDay,
                    maxDays,
                } satisfies CreateRentalListingRequest
            );

            setRentMsg(
                `Ок! Rent listing создан: id=${created.listingId}, ${created.pricePerDay}₽/day, max ${created.maxDays}d`
            );

            // убираем предмет из инвентаря (он уже в rent listing)
            setItems((prev) => {
                const next = prev.filter((x) => x.id !== item.id);
                void recalcTotal(next);
                return next;
            });
        } catch (e: unknown) {
            const msg =
                typeof (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message === "string"
                    ? (e as { response: { data: { message: string } } }).response.data.message
                    : e instanceof Error
                        ? e.message
                        : typeof (e as { message?: unknown })?.message === "string"
                            ? (e as { message: string }).message
                            : "Не получилось создать rent listing";

            setRentMsg(msg);
        } finally {
            setCreatingRentId(null);
        }
    }

    async function createInstantListing(item: InventoryItem) {
        if (!userId || !item.tradable) return;

        setCreatingId(item.id);
        setSuccess(null);

        try {
            const resp = await api.get<InstantPriceResponse>(`/market/skins/${item.skinId}/instant-price`);
            const price = resp?.price;

            if (!price || price <= 0) throw new Error("Instant price is not set");

            const created = await api.post<SaleListingCreated>("/market/sale-listings", {
                sellerId: userId,
                inventoryItemId: item.id,
                price,
            });

            await api.post<void>(`/market/sale-listings/${created.id}/instant-sell?sellerId=${userId}`, {});

            setItems((prev) => {
                const next = prev.filter((x) => x.id !== item.id);
                void recalcTotal(next);
                return next;
            });
            setSuccess(`Instant sale OK! listingId=${created.id}, price=${price}₽`);
        } catch {
            setSuccess("Не получилось instant-продать.");
        } finally {
            setCreatingId(null);
        }
    }

    async function createListing(item: InventoryItem) {
        if (!userId || !item.tradable) return;

        const priceStr = priceById[item.id] ?? "";
        const price = parsePosInt(priceStr);
        if (!price) return;

        setCreatingId(item.id);
        setSuccess(null);
        try {
            const created = await api.post<SaleListingCreated>("/market/sale-listings", {
                sellerId: userId,
                inventoryItemId: item.id,
                price,
            });

            setItems((prev) => {
                const next = prev.filter((x) => x.id !== item.id);
                void recalcTotal(next);
                return next;
            });
            setSuccess(`Выставлено! listingId=${created.id}, price=${created.price}₽`);
        } finally {
            setCreatingId(null);
        }
    }

    if (!user) return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт.</div>;

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{ margin: 0, lineHeight: 1.05 }}>My inventory</h1>

                    <div style={{ opacity: 0.8, fontSize: 14, marginTop: 6, lineHeight: 1.9 }}>
                        {loading ? "Loading..." : `Items: ${items.length} · Tradable: ${tradableCount}`}
                        {totalValue !== null && (
                            <>
                                {" "}
                                · Total value: <span style={{ fontWeight: 900 }}>{totalValue}₽</span>
                                {missingPrices > 0 && (
                                    <span style={{ opacity: 0.7 }}> (no price for {missingPrices} skins)</span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Success sell/instant */}
                    {success && (
                        <div
                            style={{
                                marginTop: 8,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid rgba(120,255,120,0.25)",
                                background: "rgba(120,255,120,0.10)",
                            }}
                        >
                            {success}{" "}
                            <Link to="/my-sales" style={{ color: "inherit", textDecoration: "underline" }}>
                                → открыть “Мои продажи”
                            </Link>
                        </div>
                    )}

                    {/* Rent message */}
                    {rentMsg && (
                        <div
                            style={{
                                marginTop: 8,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid rgba(120,170,255,0.25)",
                                background: "rgba(120,170,255,0.10)",
                            }}
                        >
                            {rentMsg}{" "}
                            <Link to="/rent" style={{ color: "inherit", textDecoration: "underline" }}>
                                → открыть “Rent market”
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => void load()}
                    disabled={loading}
                    style={{
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.06)",
                        color: "inherit",
                        cursor: "pointer",
                        height: 40,
                    }}
                >
                    Refresh
                </button>
            </div>

            {!loading && items.length === 0 && <div style={{ opacity: 0.8 }}>Инвентарь пустой</div>}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 420px))",
                    justifyContent: "start",
                    gap: 12,
                }}
            >
                {items.map((x) => {
                    const busySell = creatingId === x.id;
                    const busyRent = creatingRentId === x.id;

                    const priceStr = priceById[x.id] ?? "";
                    const priceOk = !!parsePosInt(priceStr);

                    return (
                        <div
                            key={x.id}
                            style={{
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.04)",
                                borderRadius: 14,
                                padding: 12,
                                display: "grid",
                                gap: 10,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <div style={{ fontWeight: 800 }}>{x.skinName}</div>
                                <div style={{ opacity: 0.8, fontSize: 12 }}>itemId: {x.id}</div>
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <span style={pill}>{x.rarity}</span>
                                <span style={pill}>{x.condition}</span>
                                {x.collection && <span style={pill}>{x.collection}</span>}
                                <span style={{ opacity: 0.75, fontSize: 12 }}>flag: {x.ownershipFlag}</span>
                                <span style={{ opacity: 0.75, fontSize: 12 }}>tradable: {String(x.tradable)}</span>
                            </div>

                            {/* Sell */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: 10,
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder="price ₽"
                                    value={priceStr}
                                    onChange={(e) => setPriceById((p) => ({ ...p, [x.id]: e.target.value }))}
                                    style={inputStyle}
                                    disabled={!x.tradable || busySell}
                                />

                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <button
                                        onClick={() => void createInstantListing(x)}
                                        disabled={!x.tradable || busySell}
                                        title={!x.tradable ? "Этот предмет сейчас нельзя выставить" : undefined}
                                        style={{
                                            borderRadius: 10,
                                            padding: "10px 12px",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            background: x.tradable ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                                            color: "inherit",
                                            cursor: !x.tradable || busySell ? "not-allowed" : "pointer",
                                            fontWeight: 800,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {busySell ? "..." : "Instant"}
                                    </button>

                                    <button
                                        onClick={() => void createListing(x)}
                                        disabled={!x.tradable || busySell || !priceOk}
                                        title={
                                            !x.tradable
                                                ? "Этот предмет сейчас нельзя выставить"
                                                : !priceOk
                                                    ? "Цена должна быть > 0"
                                                    : undefined
                                        }
                                        style={{
                                            borderRadius: 10,
                                            padding: "10px 12px",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            background: x.tradable ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                                            color: "inherit",
                                            cursor: !x.tradable || busySell || !priceOk ? "not-allowed" : "pointer",
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {busySell ? "Creating..." : "Sell"}
                                    </button>
                                </div>
                            </div>

                            {/* Rent listing */}
                            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                                <div style={{ opacity: 0.85, fontSize: 13, fontWeight: 800 }}>
                                    Rent (create listing)
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
                                    <input
                                        type="number"
                                        min={1}
                                        step={1}
                                        placeholder="price/day ₽"
                                        value={rentPriceById[x.id] ?? ""}
                                        onChange={(e) => setRentPriceById((p) => ({ ...p, [x.id]: e.target.value }))}
                                        disabled={busyRent}
                                        style={inputStyle}
                                    />

                                    <input
                                        type="number"
                                        min={1}
                                        max={365}
                                        step={1}
                                        placeholder="maxDays"
                                        value={rentDaysById[x.id] ?? ""}
                                        onChange={(e) => setRentDaysById((p) => ({ ...p, [x.id]: e.target.value }))}
                                        disabled={busyRent}
                                        style={inputStyle}
                                    />

                                    <button
                                        onClick={() => void createRentListing(x)}
                                        disabled={busyRent}
                                        style={{
                                            borderRadius: 10,
                                            padding: "10px 12px",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            background: "rgba(255,255,255,0.06)",
                                            color: "inherit",
                                            cursor: busyRent ? "not-allowed" : "pointer",
                                            fontWeight: 800,
                                            whiteSpace: "nowrap",
                                            height: 42,
                                        }}
                                    >
                                        {busyRent ? "..." : "Create"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const pill: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
};

const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "inherit",
    outline: "none",
};