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

export default function InventorySellPage() {
    const { user } = useAuth();
    const userId = user?.id ?? 0;

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [priceById, setPriceById] = useState<Record<number, string>>({});
    const [creatingId, setCreatingId] = useState<number | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const load = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await api.get<InventoryItem[]>(`/users/${userId}/inventory`);
            setItems(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const tradableCount = useMemo(() => items.filter((x) => x.tradable).length, [items]);

    const parsePrice = (v: string) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return null;
        const i = Math.floor(n);
        return i > 0 ? i : null;
    };

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

            setItems((prev) => prev.filter((x) => x.id !== item.id));
            setSuccess(`Instant sale OK! listingId=${created.id}, price=${price}₽`);
        } catch (e) {
            setSuccess("Не получилось instant-продать.");
        } finally {
            setCreatingId(null);
        }
    }

    async function createListing(item: InventoryItem) {
        if (!userId || !item.tradable) return;

        const priceStr = priceById[item.id] ?? "";
        const price = parsePrice(priceStr);
        if (!price) return;

        setCreatingId(item.id);
        setSuccess(null);
        try {
            const created = await api.post<SaleListingCreated>("/market/sale-listings", {
                sellerId: userId,
                inventoryItemId: item.id,
                price,
            });

            setItems((prev) => prev.filter((x) => x.id !== item.id));

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
                    <h1 style={{margin: 0, lineHeight: 1.05}}>My inventory</h1>
                    <div style={{opacity: 0.8, fontSize: 14, marginTop: 6, lineHeight: 1.9}}>
                        {loading ? "Loading..." : `Items: ${items.length} · Tradable: ${tradableCount}`}
                    </div>
                    {success && (
                        <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(120,255,120,0.25)", background: "rgba(120,255,120,0.10)" }}>
                            {success} {" "}
                            <Link to="/my-sales" style={{ color: "inherit", textDecoration: "underline" }}>
                                → открыть “Мои продажи”
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
                    const busy = creatingId === x.id;
                    const priceStr = priceById[x.id] ?? "";
                    const priceOk = !!parsePrice(priceStr);

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
                                <span style={{ opacity: 0.75, fontSize: 12 }}>
                  tradable: {String(x.tradable)}
                </span>
                            </div>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr auto",
                                gap: 10,
                                alignItems: "center"
                            }}>
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder="price ₽"
                                    value={priceStr}
                                    onChange={(e) => setPriceById((p) => ({...p, [x.id]: e.target.value}))}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "rgba(255,255,255,0.04)",
                                        color: "inherit",
                                        outline: "none",
                                    }}
                                    disabled={!x.tradable || busy}
                                />

                                <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                                    <button
                                        onClick={() => void createInstantListing(x)}
                                        disabled={!x.tradable || busy}
                                        title={!x.tradable ? "Этот предмет сейчас нельзя выставить" : undefined}
                                        style={{
                                            borderRadius: 10,
                                            padding: "10px 12px",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            background: x.tradable ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                                            color: "inherit",
                                            cursor: !x.tradable || busy ? "not-allowed" : "pointer",
                                            fontWeight: 800,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {busy ? "..." : "Instant"}
                                    </button>

                                    <button
                                        onClick={() => void createListing(x)}
                                        disabled={!x.tradable || busy || !priceOk}
                                        title={!x.tradable ? "Этот предмет сейчас нельзя выставить" : !priceOk ? "Цена должна быть > 0" : undefined}
                                        style={{
                                            borderRadius: 10,
                                            padding: "10px 12px",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            background: x.tradable ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                                            color: "inherit",
                                            cursor: !x.tradable || busy || !priceOk ? "not-allowed" : "pointer",
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {busy ? "Creating..." : "Sell"}
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