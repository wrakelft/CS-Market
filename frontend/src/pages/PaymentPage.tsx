import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";

type PaymentType = "DEPOSIT" | "WITHDRAW";
type PaymentMethod = "CARD" | "CRYPTO";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

type Payment = {
    id: number;
    userId: number;
    type: PaymentType;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    createdAt?: string;
};

type PaymentCreated = Payment;

export default function PaymentsPage() {
    const { user, refreshUser } = useAuth();
    const userId = user?.id ?? 0;

    const [items, setItems] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    // форма
    const [mode, setMode] = useState<PaymentType>("DEPOSIT");
    const [method, setMethod] = useState<PaymentMethod>("CARD");
    const [amountStr, setAmountStr] = useState<string>("");

    // “по приколу” поля (НЕ отправляем на бэк)
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cryptoWallet, setCryptoWallet] = useState("");

    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const amount = useMemo(() => {
        const n = Number(amountStr);
        if (!Number.isFinite(n)) return null;
        const v = Math.floor(n);
        return v > 0 ? v : null;
    }, [amountStr]);

    const loadPayments = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await api.get<Payment[]>(`/payments?userId=${userId}`);
            setItems(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;
        void loadPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // при смене метода чистим “прикольные” поля
    useEffect(() => {
        setCardNumber("");
        setCardExpiry("");
        setCardCvv("");
        setCryptoWallet("");
    }, [method]);

    async function createPayment() {
        if (!userId || !amount) return;

        // мини-валидация UI
        if (method === "CARD") {
            const digits = cardNumber.replace(/\s+/g, "");
            if (digits.length < 12) {
                setMessage("Карточка выглядит подозрительно короткой 😅");
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                setMessage("Срок действия в формате MM/YY");
                return;
            }
            if (!/^\d{3,4}$/.test(cardCvv)) {
                setMessage("CVV — 3–4 цифры");
                return;
            }
        }
        if (method === "CRYPTO" && cryptoWallet.trim().length < 8) {
            setMessage("Кошелёк слишком короткий");
            return;
        }

        setCreating(true);
        setMessage(null);
        try {
            // создаём payment (PENDING)
            const created = await api.post<PaymentCreated>("/payments", {
                userId,
                type: mode,
                method,
                status: "PENDING",
                amount,
            });

            // сразу “проводим” для демки → меняется баланс
            await api.patch(`/payments/${created.id}/status?status=SUCCESS`, {});

            // синхроним UI
            setAmountStr("");
            setCardNumber("");
            setCardExpiry("");
            setCardCvv("");
            setCryptoWallet("");

            setMessage(`Готово: #${created.id} • ${mode} • ${amount}₽`);

            // обновляем список и баланс в шапке
            void loadPayments();
            await refreshUser();
        } finally {
            setCreating(false);
        }
    }

    if (!user) return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт.</div>;

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{ margin: 0, lineHeight: 1.05 }}>Payments</h1>
                    <div style={{ opacity: 0.8, fontSize: 14, marginTop: 6, lineHeight: 1.2 }}>
                        {loading ? "Loading..." : `Operations: ${items.length}`}
                    </div>

                    {message && (
                        <div
                            style={{
                                marginTop: 10,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid rgba(120,255,120,0.25)",
                                background: "rgba(120,255,120,0.10)",
                            }}
                        >
                            {message}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => void loadPayments()}
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

            {/* Form card */}
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    padding: 12,
                    display: "grid",
                    gap: 12,
                    maxWidth: 860,
                }}
            >
                {/* Deposit / Withdraw */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        onClick={() => setMode("DEPOSIT")}
                        style={{
                            ...tabBtn,
                            background: mode === "DEPOSIT" ? "rgba(120,255,120,0.10)" : "rgba(255,255,255,0.04)",
                            borderColor: mode === "DEPOSIT" ? "rgba(120,255,120,0.30)" : "rgba(255,255,255,0.12)",
                        }}
                    >
                        Deposit
                    </button>
                    <button
                        onClick={() => setMode("WITHDRAW")}
                        style={{
                            ...tabBtn,
                            background: mode === "WITHDRAW" ? "rgba(255,180,80,0.10)" : "rgba(255,255,255,0.04)",
                            borderColor: mode === "WITHDRAW" ? "rgba(255,180,80,0.30)" : "rgba(255,255,255,0.12)",
                        }}
                    >
                        Withdraw
                    </button>
                </div>

                {/* Main row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                    <label style={label}>
                        <div style={labelCap}>Method</div>
                        <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} style={inputLike}>
                            <option value="CARD">CARD</option>
                            <option value="CRYPTO">CRYPTO</option>
                        </select>
                    </label>

                    <label style={label}>
                        <div style={labelCap}>Amount</div>
                        <input
                            type="number"
                            min={1}
                            step={1}
                            placeholder="₽"
                            value={amountStr}
                            onChange={(e) => setAmountStr(e.target.value)}
                            style={inputLike}
                        />
                    </label>

                    <button
                        onClick={() => void createPayment()}
                        disabled={creating || !amount}
                        style={{
                            borderRadius: 10,
                            padding: "10px 12px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: creating || !amount ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
                            color: "inherit",
                            cursor: creating || !amount ? "not-allowed" : "pointer",
                            fontWeight: 900,
                            height: 42,
                            whiteSpace: "nowrap",
                        }}
                        title={!amount ? "Сумма должна быть > 0" : undefined}
                    >
                        {creating ? "Creating..." : "Create"}
                    </button>
                </div>

                {/* Fun fields */}
                {method === "CARD" && (
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                        <label style={label}>
                            <div style={labelCap}>Card number</div>
                            <input
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                style={inputLike}
                                inputMode="numeric"
                            />
                        </label>

                        <label style={label}>
                            <div style={labelCap}>Expiry</div>
                            <input
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                style={inputLike}
                            />
                        </label>

                        <label style={label}>
                            <div style={labelCap}>CVV</div>
                            <input
                                placeholder="123"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                style={inputLike}
                                inputMode="numeric"
                            />
                        </label>
                    </div>
                )}

                {method === "CRYPTO" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                        <label style={label}>
                            <div style={labelCap}>Wallet address</div>
                            <input
                                placeholder="0x... / bc1... / whatever"
                                value={cryptoWallet}
                                onChange={(e) => setCryptoWallet(e.target.value)}
                                style={inputLike}
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* List */}
            {!loading && items.length === 0 && <div style={{ opacity: 0.8 }}>Пока операций нет</div>}

            <div style={{ display: "grid", gap: 10 }}>
                {items.map((p) => {
                    const typeStyle = pillByType(p.type);
                    const statusStyle = pillByStatus(p.status);

                    return (
                        <div
                            key={p.id}
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
                                <div style={{ fontWeight: 900 }}>#{p.id}</div>
                                <div style={{ fontWeight: 900, fontSize: 16 }}>{p.amount}₽</div>
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ ...pillBase, ...typeStyle }}>{p.type}</span>
                                <span style={{ ...pillBase, ...pillByMethod(p.method) }}>{p.method}</span>
                                <span style={{ ...pillBase, ...statusStyle }}>{p.status}</span>
                                {p.createdAt && <span style={{ opacity: 0.65, fontSize: 12 }}>created: {p.createdAt}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const tabBtn: React.CSSProperties = {
    borderRadius: 999,
    padding: "8px 12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
};

const label: React.CSSProperties = { display: "grid", gap: 6 };
const labelCap: React.CSSProperties = { fontSize: 12, opacity: 0.8 };

const inputLike: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "inherit",
    outline: "none",
};

const pillBase: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 800,
};

function pillByType(t: PaymentType): React.CSSProperties {
    if (t === "DEPOSIT") return { border: "1px solid rgba(120,255,120,0.35)", background: "rgba(120,255,120,0.10)" };
    return { border: "1px solid rgba(255,180,80,0.35)", background: "rgba(255,180,80,0.10)" };
}

function pillByStatus(s: PaymentStatus): React.CSSProperties {
    if (s === "SUCCESS") return { border: "1px solid rgba(120,255,120,0.35)", background: "rgba(120,255,120,0.10)" };
    if (s === "FAILED") return { border: "1px solid rgba(255,120,120,0.35)", background: "rgba(255,120,120,0.10)" };
    return { border: "1px solid rgba(160,160,255,0.35)", background: "rgba(160,160,255,0.10)" };
}

function pillByMethod(m: PaymentMethod): React.CSSProperties {
    if (m === "CARD") return { border: "1px solid rgba(180,220,255,0.35)", background: "rgba(180,220,255,0.10)" };
    return { border: "1px solid rgba(200,255,200,0.25)", background: "rgba(200,255,200,0.08)" };
}