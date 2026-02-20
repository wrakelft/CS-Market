import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";

type DeletionStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";

type DeletionRequest = {
    id: number;
    userId: number;
    status: DeletionStatus | string;
    createdAt?: string;
    updatedAt?: string;
    processedAt?: string;
};

type DeletionRequestCreated = DeletionRequest;

export default function DeletionRequestsPage() {
    const { user } = useAuth();
    const userId = user?.id ?? 0;

    const [items, setItems] = useState<DeletionRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const [creating, setCreating] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const latest = useMemo(() => (items.length ? items[0] : null), [items]);
    const hasPending = useMemo(
        () => items.some((x) => String(x.status).toUpperCase() === "PENDING"),
        [items]
    );

    const load = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await api.get<DeletionRequest[]>(`/deletion-requests?userId=${userId}`);
            setItems(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    async function createDeletionRequest() {
        if (!userId) return;

        setCreating(true);
        setMsg(null);

        try {
            const created = await api.post<DeletionRequestCreated>("/deletion-requests", {
                userId,
            });

            setMsg(`Запрос создан! id=#${created.id}, status=${created.status}`);
            void load();
        } catch (e: unknown) {
            const m = e instanceof Error ? e.message : typeof e === "string" ? e : "Не удалось создать запрос";
            setMsg(m);
        } finally {
            setCreating(false);
        }
    }

    async function cancelDeletionRequest(requestId: number) {
        setMsg(null);
        try {
            const updated = await api.patch<DeletionRequest>(`/deletion-requests/${requestId}/cancel`, {});
            setItems((prev) => prev.map((x) => (x.id === requestId ? updated : x)));
            setMsg(`Запрос отменён! id=#${updated.id}, status=${updated.status}`);
        } catch (e: unknown) {
            const m = e instanceof Error ? e.message : typeof e === "string" ? e : "Не удалось отменить запрос";
            setMsg(m);
        }
    }

    if (!user) return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт.</div>;

    return (
        <div style={{ display: "grid", gap: 14, maxWidth: 860 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{ margin: 0, lineHeight: 1.05 }}>Delete account</h1>
                    <div style={{ opacity: 0.8, fontSize: 14, marginTop: 6, lineHeight: 1.2 }}>
                        Здесь создаётся запрос на удаление аккаунта. (Да, это кнопка “без пути назад”, как в хоррорах.)
                    </div>
                    {latest && (
                        <div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>
                            Latest status: <span style={{ ...pillBase, ...pillByStatus(latest.status) }}>{latest.status}</span>
                        </div>
                    )}
                </div>

                <div style={{display: "grid", gap: 10, justifyItems: "end"}}>
                    <button
                        onClick={() => void load()}
                        disabled={loading}
                        style={btn}
                    >
                        Refresh
                    </button>

                    <button
                        onClick={() => void createDeletionRequest()}
                        disabled={creating || hasPending}
                        style={{
                            ...btn,
                            border: "1px solid rgba(255,120,120,0.30)",
                            background: creating || hasPending ? "rgba(255,120,120,0.04)" : "rgba(255,120,120,0.10)",
                            fontWeight: 900,
                            cursor: creating || hasPending ? "not-allowed" : "pointer",
                            opacity: creating || hasPending ? 0.7 : 1,
                        }}
                        title={hasPending ? "У тебя уже есть запрос со статусом PENDING — сначала отмени его" : "Создать запрос на удаление аккаунта"}
                    >
                        {creating ? "Creating..." : hasPending ? "Request pending" : "Delete account"}
                    </button>
                </div>
            </div>

            {msg && (
                <div
                    style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.05)",
                    }}
                >
                    {msg}
                </div>
            )}

            {/* List */}
            <div style={{display: "grid", gap: 10}}>
                <div style={{fontWeight: 900, opacity: 0.9}}>My deletion requests</div>

                {!loading && items.length === 0 && <div style={{ opacity: 0.8 }}>Запросов пока нет</div>}

                {items.map((r) => (
                    <div
                        key={r.id}
                        style={{
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 14,
                            padding: 12,
                            display: "grid",
                            gap: 8,
                        }}
                    >
                        <div style={{display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center"}}>
                            <div style={{fontWeight: 900}}>#{r.id}</div>

                            <div style={{display: "flex", gap: 10, alignItems: "center"}}>
                                <span style={{...pillBase, ...pillByStatus(r.status)}}>{r.status}</span>

                                {String(r.status).toUpperCase() === "PENDING" && (
                                    <button
                                        onClick={() => void cancelDeletionRequest(r.id)}
                                        style={{
                                            borderRadius: 10,
                                            padding: "8px 10px",
                                            border: "1px solid rgba(255,180,80,0.30)",
                                            background: "rgba(255,180,80,0.10)",
                                            color: "inherit",
                                            cursor: "pointer",
                                            fontWeight: 900,
                                        }}
                                        title="Отменить запрос"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.75, fontSize: 12}}>
                            {r.createdAt && <span>created: {r.createdAt}</span>}
                            {r.updatedAt && <span>updated: {r.updatedAt}</span>}
                            {r.processedAt && <span>processed: {r.processedAt}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const btn: React.CSSProperties = {
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    cursor: "pointer",
    height: 40,
};

const pillBase: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
};

function pillByStatus(s: string): React.CSSProperties {
    const v = String(s).toUpperCase();
    if (v === "PENDING") return { border: "1px solid rgba(160,160,255,0.35)", background: "rgba(160,160,255,0.10)" };
    if (v === "APPROVED") return { border: "1px solid rgba(120,255,120,0.35)", background: "rgba(120,255,120,0.10)" };
    if (v === "DONE") return { border: "1px solid rgba(120,255,120,0.35)", background: "rgba(120,255,120,0.10)" };
    if (v === "REJECTED") return { border: "1px solid rgba(255,120,120,0.35)", background: "rgba(255,120,120,0.10)" };
    if (v === "CANCELLED") return { border: "1px solid rgba(255,180,80,0.35)", background: "rgba(255,180,80,0.10)" };
    return { border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)" };
}