import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";

type SaleListing = {
    id: number;
    price: number;
    status: string;

    inventoryItemId: number;
    sellerId: number;

    skinId: number;
    skinName: string;
    rarity: string;
    condition: string;
    collection: string;
};

type PricePoint = {
    price: number;
    recordedAt: string;
};

const PAGE_SIZE = 24;

function debounceTimeout<T>(cb: (v: T) => void, delay = 300) {
    let t: number | undefined;
    return (v: T) => {
        window.clearTimeout(t);
        t = window.setTimeout(() => cb(v), delay);
    };
}

function PriceChart({ points, height = 70 }: { points: PricePoint[]; height?: number }) {
    if (!points || points.length < 2) {
        return <div style={{ opacity: 0.7, fontSize: 12 }}>Недостаточно данных для графика</div>;
    }

    const width = 320;
    const pad = 6;

    const prices = points.map((p) => p.price);
    let min = Math.min(...prices);
    let max = Math.max(...prices);
    if (min === max) {
        min = min - 1;
        max = max + 1;
    }

    const toX = (i: number) => pad + (i * (width - pad * 2)) / (points.length - 1);
    const toY = (price: number) => {
        const t = (price - min) / (max - min);
        return pad + (1 - t) * (height - pad * 2);
    };

    const d = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(2)} ${toY(p.price).toFixed(2)}`)
        .join(" ");

    const last = points[points.length - 1]?.price ?? 0;
    const first = points[0]?.price ?? 0;
    const diff = last - first;
    const pct = first ? Math.round((diff / first) * 100) : 0;

    return (
        <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.85 }}>
                <span>min: {Math.min(...prices)}₽</span>
                <span>max: {Math.max(...prices)}₽</span>
                <span>
          Δ: {diff >= 0 ? "+" : ""}
                    {diff}₽ ({pct >= 0 ? "+" : ""}
                    {pct}%)
        </span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: "block" }}>
                {/* линия */}
                <path d={d} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
            </svg>
        </div>
    );
}

export default function MarketSale() {
    const { user } = useAuth();
    const userId = user?.id ?? 0;

    const [openDetails, setOpenDetails] = useState<Set<number>>(() => new Set());
    const [historyBySkin, setHistoryBySkin] = useState<Record<number, PricePoint[]>>({});
    const [historyLoading, setHistoryLoading] = useState<Record<number, boolean>>({});

    const [rawQ, setRawQ] = useState("");
    const [q, setQ] = useState("");

    const [rarity, setRarity] = useState("");
    const [condition, setCondition] = useState("");
    const [collection, setCollection] = useState("");

    const [all, setAll] = useState<SaleListing[]>([]);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(false);

    const [addingId, setAddingId] = useState<number | null>(null);

    const [added, setAdded] = useState<Set<number>>(() => new Set());

    const debQ = useRef(
        debounceTimeout<string>((v) => {
            setQ(v);
            setVisible(PAGE_SIZE);
        }, 300)
    );

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.get<SaleListing[]>("/market/sale-listings");
            setAll(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return all.filter((x) => {
            if (qq && !x.skinName.toLowerCase().includes(qq)) return false;
            if (rarity && x.rarity !== rarity) return false;
            if (condition && x.condition !== condition) return false;
            if (collection && x.collection !== collection) return false;
            return true;
        });
    }, [all, q, rarity, condition, collection]);

    const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible]);
    const hasMore = visible < filtered.length;

    const collectionOptions = useMemo(() => {
        const set = new Set<string>();
        all.forEach((s) => {
            if (s.collection) set.add(s.collection);
        });
        return Array.from(set).sort();
    }, [all]);

    async function toggleDetails(skinId: number) {
        setOpenDetails((prev) => {
            const next = new Set(prev);
            if (next.has(skinId)) next.delete(skinId);
            else next.add(skinId);
            return next;
        });

        if (historyBySkin[skinId]) return;

        setHistoryLoading((p) => ({ ...p, [skinId]: true }));
        try {
            const points = await api.get<PricePoint[]>(`/skins/${skinId}/price-history`);
            setHistoryBySkin((p) => ({ ...p, [skinId]: points ?? [] }));
        } finally {
            setHistoryLoading((p) => ({ ...p, [skinId]: false }));
        }
    }

    async function addToCart(listingId: number) {
        if (!userId) return;
        if (addingId !== null) return;

        setAddingId(listingId);
        try {
            await api.post("/cart/item", { userId, saleListingId: listingId });

            // отметим добавленным
            setAdded((prev) => {
                const next = new Set(prev);
                next.add(listingId);
                return next;
            });

            setAll((prev) => prev.filter((x) => x.id !== listingId));

        } finally {
            setAddingId(null);
        }
    }

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {/* Header */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "start",
                    gap: 12,
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>Market</h1>
                    <div style={{ opacity: 0.8, fontSize: 14 }}>
                        {loading ? "Loading..." : `Found: ${filtered.length}`}
                    </div>
                </div>

                <button
                    onClick={() => {
                        setRawQ("");
                        setQ("");
                        setRarity("");
                        setCondition("");
                        setCollection("");
                        setVisible(PAGE_SIZE);
                        void load();
                    }}
                    style={{
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.06)",
                        color: "inherit",
                        cursor: "pointer",
                        height: 40,
                    }}
                    disabled={loading}
                >
                    Reset
                </button>
            </div>

            {/* Filters */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.0fr 0.7fr 0.7fr",
                    gap: 10,
                }}
            >
                <input
                    value={rawQ}
                    onChange={(e) => {
                        setRawQ(e.target.value);
                        debQ.current(e.target.value);
                    }}
                    placeholder="Search by skin name..."
                    style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: "inherit",
                        outline: "none",
                    }}
                />

                <input
                    list="collections"
                    value={collection}
                    onChange={(e) => {
                        setCollection(e.target.value);
                        setVisible(PAGE_SIZE);
                    }}
                    placeholder="Collection..."
                    style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: "inherit",
                        outline: "none",
                    }}
                />
                <datalist id="collections">
                    {collectionOptions.slice(0, 50).map((c) => (
                        <option key={c} value={c} />
                    ))}
                </datalist>

                <select
                    value={rarity}
                    onChange={(e) => {
                        setRarity(e.target.value);
                        setVisible(PAGE_SIZE);
                    }}
                    style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(20,20,20,0.35)",
                        color: "inherit",
                        outline: "none",
                    }}
                >
                    <option value="">Rarity (all)</option>
                    <option value="CONSUMER">CONSUMER</option>
                    <option value="INDUSTRIAL">INDUSTRIAL</option>
                    <option value="MIL_SPEC">MIL_SPEC</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CLASSIFIED">CLASSIFIED</option>
                    <option value="COVERT">COVERT</option>
                </select>

                <select
                    value={condition}
                    onChange={(e) => {
                        setCondition(e.target.value);
                        setVisible(PAGE_SIZE);
                    }}
                    style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(20,20,20,0.35)",
                        color: "inherit",
                        outline: "none",
                    }}
                >
                    <option value="">Condition (all)</option>
                    <option value="FN">FN</option>
                    <option value="MW">MW</option>
                    <option value="FT">FT</option>
                    <option value="WW">WW</option>
                    <option value="BS">BS</option>
                </select>
            </div>

            {/* Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 360px))",
                    justifyContent: "start",
                    gap: 12,
                }}
            >
                {shown.map((x) => {
                    const isAdding = addingId === x.id;
                    const isAdded = added.has(x.id);
                    const detailsOpen = openDetails.has(x.skinId);
                    const hLoading = !!historyLoading[x.skinId];
                    const points = historyBySkin[x.skinId] ?? [];

                    return (
                        <div
                            key={x.id}
                            style={{
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.04)",
                                borderRadius: 14,
                                padding: 12,
                                display: "grid",
                                gap: 8,
                            }}
                        >
                            <div style={{display: "flex", justifyContent: "space-between", gap: 10}}>
                                <div style={{fontWeight: 700, lineHeight: "20px"}}>{x.skinName}</div>

                                <div style={{display: "grid", justifyItems: "end", lineHeight: 1.1}}>
                                    <div style={{fontWeight: 800, fontSize: 16}}>{x.price}₽</div>
                                    <div style={{opacity: 0.65, fontSize: 12}}>skinId: {x.skinId}</div>
                                </div>
                            </div>

                            <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                <span
                    style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "rgba(255,255,255,0.06)",
                    }}
                >
                  {x.rarity}
                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        padding: "4px 8px",
                                        borderRadius: 999,
                                        border: "1px solid rgba(255,255,255,0.14)",
                                        background: "rgba(255,255,255,0.06)",
                                    }}
                                >
                  {x.condition}
                </span>
                                <span style={{ opacity: 0.75, fontSize: 12 }}>status: {x.status}</span>
                            </div>

                            <div style={{ opacity: 0.8, fontSize: 13 }}>{x.collection}</div>

                            <button
                                onClick={() => void toggleDetails(x.skinId)}
                                style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    padding: "10px 12px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    background: "rgba(255,255,255,0.03)",
                                    color: "inherit",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                }}
                            >
                                {detailsOpen ? "Hide details" : "Details"}
                            </button>

                            {detailsOpen && (
                                <div
                                    style={{
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        borderRadius: 12,
                                        padding: 10,
                                        background: "rgba(255,255,255,0.02)",
                                        display: "grid",
                                        gap: 8,
                                    }}
                                >
                                    <div style={{ opacity: 0.8, fontSize: 12 }}>Price history</div>

                                    {hLoading ? (
                                        <div style={{ opacity: 0.75, fontSize: 12 }}>Loading history…</div>
                                    ) : (
                                        <PriceChart points={points} />
                                    )}
                                </div>
                            )}

                            {/* Action */}
                            <button
                                onClick={() => void addToCart(x.id)}
                                disabled={!userId || loading || isAdding || isAdded}
                                title={!userId ? "Сначала войди в аккаунт" : undefined}
                                style={{
                                    marginTop: 6,
                                    width: "100%",
                                    borderRadius: 12,
                                    padding: "10px 12px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    background: isAdded ? "rgba(100, 200, 140, 0.12)" : "rgba(255,255,255,0.06)",
                                    color: "inherit",
                                    cursor: !userId || loading || isAdding || isAdded ? "not-allowed" : "pointer",
                                    fontWeight: 700,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {!userId ? "Войдите чтобы купить" : isAdded ? "Добавлено" : isAdding ? "Добавляю..." : "В корзину"}
                            </button>
                        </div>
                    );
                })}
            </div>

            {!loading && filtered.length === 0 && (
                <div style={{ opacity: 0.8, padding: "10px 0" }}>Nothing found</div>
            )}

            {/* Load more */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
                {hasMore && (
                    <button
                        onClick={() => setVisible((v) => v + PAGE_SIZE)}
                        style={{
                            borderRadius: 12,
                            padding: "10px 14px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.06)",
                            color: "inherit",
                            cursor: "pointer",
                        }}
                    >
                        Load more
                    </button>
                )}
                {!hasMore && filtered.length > 0 && <div style={{ opacity: 0.7 }}>That’s all</div>}
            </div>
        </div>
    );
}