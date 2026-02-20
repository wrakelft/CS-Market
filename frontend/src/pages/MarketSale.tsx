import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";

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

const PAGE_SIZE = 24;

function debounceTimeout<T>(cb: (v: T) => void, delay = 300) {
    let t: number | undefined;
    return (v: T) => {
        window.clearTimeout(t);
        t = window.setTimeout(() => cb(v), delay);
    };
}

export default function MarketSale() {
    const [rawQ, setRawQ] = useState("");
    const [q, setQ] = useState("");

    const [rarity, setRarity] = useState("");
    const [condition, setCondition] = useState("");
    const [collection, setCollection] = useState("");

    const [all, setAll] = useState<SaleListing[]>([]);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(false);

    // При изменении поиска — обновляем q и сбрасываем "load more"
    const debQ = useRef(
        debounceTimeout<string>((v) => {
            setQ(v);
            setVisible(PAGE_SIZE);
        }, 300)
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        api
            .get<SaleListing[]>("/market/sale-listings")
            .then((data) => {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setAll(data ?? []);
            })
            .finally(() => {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLoading(false);
            });
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
                {shown.map((x) => (
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
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontWeight: 700, lineHeight: "20px" }}>{x.skinName}</div>
                            <div style={{ fontWeight: 800, fontSize: 16 }}>{x.price}₽</div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                    </div>
                ))}
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