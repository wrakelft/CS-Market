import { useEffect, useMemo, useState } from "react";
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

export default function MySalesPage() {
    const { user } = useAuth();
    const userId = user?.id ?? 0;

    const [items, setItems] = useState<SaleListing[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await api.get<SaleListing[]>(`/market/sale-listings?ownerId=${userId}`);
            setItems(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const active = useMemo(() => items.filter((x) => x.status !== "SOLD").length, [items]);

    if (!user) return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт.</div>;

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{margin: 0, lineHeight: 1.05}}>My sales</h1>
                    <div style={{opacity: 0.8, fontSize: 14, marginTop: 6, lineHeight: 1.9}}>
                        {loading ? "Loading..." : `Listings: ${items.length} · Active-ish: ${active}`}
                    </div>
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

            {!loading && items.length === 0 && <div style={{ opacity: 0.8 }}>Пока ничего не выставлено</div>}

            <div style={{ display: "grid", gap: 10 }}>
                {items.map((x) => (
                    <div
                        key={x.id}
                        style={{
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 14,
                            padding: 12,
                            display: "grid",
                            gap: 8,
                            maxWidth: 860,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                            <div style={{ fontWeight: 800 }}>{x.skinName}</div>
                            <div style={{ fontWeight: 900, fontSize: 16 }}>{x.price}₽</div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={pill}>{x.rarity}</span>
                            <span style={pill}>{x.condition}</span>
                            {x.collection && <span style={pill}>{x.collection}</span>}
                            <span style={{ opacity: 0.75, fontSize: 12 }}>status: {x.status}</span>
                        </div>

                        <div style={{ opacity: 0.8, fontSize: 13 }}>
                            listingId: {x.id} • inventoryItemId: {x.inventoryItemId}
                        </div>
                    </div>
                ))}
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