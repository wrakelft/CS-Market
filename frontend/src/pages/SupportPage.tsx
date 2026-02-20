import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";
import { Link } from "react-router-dom";

type Ticket = {
    id: number;
    userId?: number;
    subject: string;
    description?: string;
    status?: string;
    createdAt?: string;
};

type TicketCreated = {
    id: number;
};

export default function SupportPage() {
    const { user } = useAuth();
    const userId = user?.id ?? 0;

    // create form
    const [subject, setSubject] = useState("");
    const [text, setText] = useState("");

    const [sending, setSending] = useState(false);
    const [successId, setSuccessId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // list
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingList, setLoadingList] = useState(false);

    const canSend = useMemo(() => {
        const s = subject.trim();
        const t = text.trim();
        return s.length >= 3 && t.length >= 5;
    }, [subject, text]);

    const loadTickets = async () => {
        if (!userId) return;
        setLoadingList(true);
        try {
            const data = await api.get<Ticket[]>(`/tickets?userId=${userId}`);
            setTickets(data ?? []);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        if (!userId) return;
        void loadTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    async function submit() {
        if (!userId || !canSend) return;

        setSending(true);
        setError(null);
        setSuccessId(null);

        try {
            const created = await api.post<TicketCreated>("/tickets", {
                userId,
                topic: subject.trim(),
                description: text.trim(),
            });

            setSuccessId(created.id);
            setSubject("");
            setText("");

            void loadTickets();
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : typeof e === "string" ? e : "Не удалось создать тикет";
            setError(msg);
        } finally {
            setSending(false);
        }
    }

    if (!user) return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт.</div>;

    return (
        <div style={{ display: "grid", gap: 14, maxWidth: 860 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{ margin: 0, lineHeight: 1.05 }}>Support</h1>
                    <div style={{ opacity: 0.8, fontSize: 14, marginTop: 6, lineHeight: 1.2 }}>
                        Создай тикет и отслеживай его ниже.
                    </div>
                </div>

                <button
                    onClick={() => void loadTickets()}
                    disabled={loadingList}
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

            {successId !== null && (
                <div
                    style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(120,255,120,0.25)",
                        background: "rgba(120,255,120,0.10)",
                        fontWeight: 800,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                    }}
                >
                    <span>Тикет создан! id: #{successId}</span>
                    <Link to={`/tickets/${successId}`} style={{ color: "inherit", textDecoration: "underline" }}>
                        открыть →
                    </Link>
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,120,120,0.25)",
                        background: "rgba(255,120,120,0.10)",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Form */}
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    padding: 12,
                    display: "grid",
                    gap: 12,
                }}
            >
                <label style={label}>
                    <div style={labelCap}>Тема</div>
                    <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Например: не приходит баланс после платежа"
                        style={inputLike}
                        maxLength={120}
                    />
                </label>

                <label style={label}>
                    <div style={labelCap}>Текст</div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Опиши проблему: шаги, что ожидал, что получилось…"
                        style={{ ...inputLike, minHeight: 140, resize: "vertical" }}
                        maxLength={2000}
                    />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={() => void submit()}
                        disabled={!canSend || sending}
                        style={{
                            borderRadius: 10,
                            padding: "10px 12px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: !canSend || sending ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
                            color: "inherit",
                            cursor: !canSend || sending ? "not-allowed" : "pointer",
                            fontWeight: 900,
                            height: 42,
                        }}
                        title={!canSend ? "Заполни тему и текст" : undefined}
                    >
                        {sending ? "Sending..." : "Create ticket"}
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontWeight: 900, opacity: 0.9 }}>My tickets</div>

                {!loadingList && tickets.length === 0 && <div style={{ opacity: 0.8 }}>Пока тикетов нет</div>}

                {tickets.map((t) => (
                    <Link
                        key={t.id}
                        to={`/tickets/${t.id}`}
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <div
                            style={{
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.04)",
                                borderRadius: 14,
                                padding: 12,
                                display: "grid",
                                gap: 8,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                <div style={{ fontWeight: 900 }}>#{t.id} • {t.subject}</div>
                                {t.status && <span style={pill}>{t.status}</span>}
                            </div>

                            {t.description && (
                                <div style={{ opacity: 0.8, fontSize: 13, lineHeight: 1.25 }}>
                                    {t.description.length > 140 ? t.description.slice(0, 140) + "…" : t.description}
                                </div>
                            )}

                            {t.createdAt && <div style={{ opacity: 0.65, fontSize: 12 }}>created: {t.createdAt}</div>}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

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

const pill: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(160,160,255,0.35)",
    background: "rgba(160,160,255,0.10)",
    fontWeight: 800,
};