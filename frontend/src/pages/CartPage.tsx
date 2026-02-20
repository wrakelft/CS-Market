import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";

type CartItem = {
    id: number;
    saleListingId: number | null;
    inventoryItemId: number | null;
    skinId: number;
    skinName: string;
    price: number;
    itemStatus: string;
    reservedUntil: string | null;
    transactionId: number | null;
};

type CartDto = {
    id: number;
    userId: number;
    status: string;
    createdAt: string;
    reservedUntil: string | null;
    items: CartItem[];
};

function makeEmptyCart(userId: number): CartDto {
    return {
        id: 0,
        userId,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        reservedUntil: null,
        items: [],
    };
}

export default function CartPage() {
    const { user } = useAuth();
    const userId = useMemo(() => user?.id ?? 0, [user]);

    const [cart, setCart] = useState<CartDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [busyItemId, setBusyItemId] = useState<number | null>(null);

    const total = useMemo(() => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce((sum, x) => sum + (x.price || 0), 0);
    }, [cart]);

    const load = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const data = await api.get<CartDto>(`/cart/${userId}`);
            setCart(data);
        } catch (e: unknown) {
            // api уже покажет ошибку через ErrorBanner.
            // Но если это 404 (корзины нет) — просто считаем пустой корзиной.
            if (typeof e === "object" && e && "status" in e) {
                const st = (e as { status?: number }).status;
                if (st === 404) {
                    setCart(makeEmptyCart(userId));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const removeItem = async (cartItemId: number) => {
        if (!userId) return;

        setBusyItemId(cartItemId);
        try {
            const updated = await api.del<CartDto>(`/cart/${userId}/items/${cartItemId}`);
            setCart(updated);
        } finally {
            setBusyItemId(null);
        }
    };

    const checkoutItem = async (cartItemId: number) => {
        if (!userId) return;

        setBusyItemId(cartItemId);
        try {
            await api.post<string>(`/cart/checkout-item`, { userId, cartItemId });
            await load();
        } finally {
            setBusyItemId(null);
        }
    };

    if (!user) {
        return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт, чтобы открыть корзину.</div>;
    }

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{ margin: 0 }}>Cart</h1>
                    <div style={{ opacity: 0.8, fontSize: 14 }}>
                        {loading ? "Loading..." : cart ? `Items: ${cart.items.length} • Total: ${total}₽` : "No cart"}
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

            {!loading && cart && cart.items.length === 0 && <div style={{ opacity: 0.8 }}>Корзина пустая</div>}

            <div style={{ display: "grid", gap: 10 }}>
                {cart?.items?.map((x) => (
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
                            <div style={{ fontWeight: 700 }}>{x.skinName}</div>
                            <div style={{ fontWeight: 800, fontSize: 16 }}>{x.price}₽</div>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.8, fontSize: 13 }}>
                            <div>itemId: {x.id}</div>
                            {x.saleListingId != null && <div>saleListingId: {x.saleListingId}</div>}
                            <div>status: {x.itemStatus}</div>
                            {x.reservedUntil && <div>reservedUntil: {x.reservedUntil}</div>}
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={() => void removeItem(x.id)}
                                disabled={busyItemId === x.id}
                                style={{
                                    borderRadius: 10,
                                    padding: "10px 12px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    background: "rgba(255,255,255,0.06)",
                                    color: "inherit",
                                    cursor: "pointer",
                                }}
                            >
                                Remove
                            </button>

                            <button
                                onClick={() => void checkoutItem(x.id)}
                                disabled={busyItemId === x.id}
                                style={{
                                    borderRadius: 10,
                                    padding: "10px 12px",
                                    border: "1px solid rgba(120,255,120,0.25)",
                                    background: "rgba(120,255,120,0.10)",
                                    color: "inherit",
                                    cursor: "pointer",
                                }}
                            >
                                Buy
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}