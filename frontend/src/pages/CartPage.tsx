import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../auth/authContext";
import { getToken } from "../auth/tokenStorage";

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

async function requestJson<T>(
    path: string,
    init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; text: string }> {
    const token = getToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers || {}),
        },
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) return { ok: false, status: res.status, text };

    if (!text) return { ok: true, data: undefined as T };
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return { ok: true, data: text as unknown as T };
    return { ok: true, data: JSON.parse(text) as T };
}

function emptyCart(userId: number): CartDto {
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
            const r = await requestJson<CartDto>(`/cart/${userId}`, { method: "GET" });
            if (r.ok) {
                setCart(r.data);
            } else if (r.status === 404) {
                // нет активной корзины = просто пустая корзина
                setCart(emptyCart(userId));
            } else {
                throw new Error(r.text || `HTTP ${r.status}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load(); // чтобы не было "Promise returned from load is ignored"
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const removeItem = async (cartItemId: number) => {
        if (!userId) return;
        setBusyItemId(cartItemId);
        try {
            const r = await requestJson<CartDto>(`/cart/${userId}/items/${cartItemId}`, {
                method: "DELETE",
            });

            if (r.ok) setCart(r.data);
            else if (r.status === 404) setCart(emptyCart(userId));
            else throw new Error(r.text || `HTTP ${r.status}`);
        } finally {
            setBusyItemId(null);
        }
    };

    const checkoutItem = async (cartItemId: number) => {
        if (!userId) return;
        setBusyItemId(cartItemId);
        try {
            const r = await requestJson<string>(`/cart/checkout-item`, {
                method: "POST",
                body: JSON.stringify({ userId, cartItemId }),
            });

            if (!r.ok) throw new Error(r.text || `HTTP ${r.status}`);
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
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "start",
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>Cart</h1>
                    <div style={{ opacity: 0.8, fontSize: 14 }}>
                        {loading
                            ? "Loading..."
                            : cart
                                ? `Items: ${cart.items.length} • Total: ${total}₽`
                                : "No cart"}
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

            {!loading && cart && cart.items.length === 0 && (
                <div style={{ opacity: 0.8 }}>Корзина пустая</div>
            )}

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