import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/authContext";

type Attachment = {
    id: number;
    fileName: string;
    fileUrl: string;
};

type Ticket = {
    id: number;
    topic: string;
    description: string;
    userId: number;
    createdAt?: string;
    closedAt?: string;
    attachments?: Attachment[];
};

export default function TicketPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const ticketId = Number(id);

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(false);

    const [err, setErr] = useState<string | null>(null);

    const [fileName, setFileName] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [adding, setAdding] = useState(false);

    const canAdd = useMemo(() => {
        const n = fileName.trim();
        const u = fileUrl.trim();
        return n.length >= 2 && u.length >= 5;
    }, [fileName, fileUrl]);

    const load = async () => {
        if (!Number.isFinite(ticketId) || ticketId <= 0) return;
        setLoading(true);
        setErr(null);
        try {
            const data = await api.get<Ticket>(`/tickets/${ticketId}`);
            setTicket(data ?? null);
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : typeof e === "string" ? e : "Не удалось загрузить тикет";
            setErr(msg);
            setTicket(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]);

    async function addAttachment() {
        if (!canAdd || !Number.isFinite(ticketId) || ticketId <= 0) return;

        setAdding(true);
        setErr(null);
        try {
            const created = await api.post<Attachment>(`/tickets/${ticketId}/attachments`, {
                fileName: fileName.trim(),
                fileUrl: fileUrl.trim(),
            });

            setTicket((prev) => {
                if (!prev) return prev;
                const next: Ticket = {
                    ...prev,
                    attachments: [created, ...(prev.attachments ?? [])],
                };
                return next;
            });

            setFileName("");
            setFileUrl("");
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : typeof e === "string" ? e : "Не удалось добавить вложение";
            setErr(msg);
        } finally {
            setAdding(false);
        }
    }

    async function deleteAttachment(attachmentId: number) {
        if (!attachmentId) return;

        setTicket((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                attachments: (prev.attachments ?? []).filter((a) => a.id !== attachmentId),
            };
        });

        try {
            await api.del(`/tickets/attachments/${attachmentId}`);
        } catch (e: unknown) {
            void load();
            const msg =
                e instanceof Error ? e.message : typeof e === "string" ? e : "Не удалось удалить вложение";
            setErr(msg);
        }
    }

    if (!user) return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт.</div>;

    return (
        <div style={{ display: "grid", gap: 14, maxWidth: 860 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{ margin: 0 }}>
                        Ticket #{Number.isFinite(ticketId) ? ticketId : "?"}
                    </h1>
                    <div style={{ opacity: 0.8, fontSize: 14, marginTop: 6 }}>
                        <Link to="/support" style={{ color: "inherit", textDecoration: "underline" }}>
                            ← back to support
                        </Link>
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

            {err && (
                <div
                    style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,120,120,0.25)",
                        background: "rgba(255,120,120,0.10)",
                    }}
                >
                    {err}
                </div>
            )}

            {loading && <div style={{ opacity: 0.8 }}>Loading...</div>}

            {/* Ticket info */}
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    padding: 12,
                    display: "grid",
                    gap: 10,
                }}
            >
                <div style={{ fontWeight: 900 }}>Ticket info</div>

                {!ticket && !loading && (
                    <div style={{ opacity: 0.75 }}>
                        Тикет не загрузился. Проверь, что на бэке есть GET /tickets/{`{ticketId}`} и что тикет твой.
                    </div>
                )}

                {ticket && (
                    <>
                        <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ opacity: 0.7, fontSize: 12 }}>Topic</div>
                            <div style={{ fontWeight: 900, lineHeight: 1.2 }}>{ticket.topic}</div>
                        </div>

                        <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ opacity: 0.7, fontSize: 12 }}>Description</div>
                            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.3, opacity: 0.9 }}>
                                {ticket.description}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.75, fontSize: 12 }}>
                            {ticket.createdAt && <span>created: {ticket.createdAt}</span>}
                            {ticket.closedAt && <span>closed: {ticket.closedAt}</span>}
                        </div>
                    </>
                )}
            </div>

            {/* Add attachment */}
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
                <div style={{ fontWeight: 900 }}>Attachments</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                    <label style={label}>
                        <div style={labelCap}>File name</div>
                        <input
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="screenshot.png"
                            style={inputLike}
                            maxLength={128}
                        />
                    </label>

                    <label style={label}>
                        <div style={labelCap}>File URL</div>
                        <input
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            placeholder="https://..."
                            style={inputLike}
                            maxLength={512}
                        />
                    </label>

                    <button
                        onClick={() => void addAttachment()}
                        disabled={!canAdd || adding}
                        style={{
                            borderRadius: 10,
                            padding: "10px 12px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: !canAdd || adding ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
                            color: "inherit",
                            cursor: !canAdd || adding ? "not-allowed" : "pointer",
                            fontWeight: 900,
                            height: 42,
                            whiteSpace: "nowrap",
                        }}
                        title={!canAdd ? "Заполни fileName и fileUrl" : undefined}
                    >
                        {adding ? "Adding..." : "Add"}
                    </button>
                </div>

                {/* list */}
                {ticket?.attachments && ticket.attachments.length === 0 && (
                    <div style={{ opacity: 0.8 }}>Вложений пока нет</div>
                )}

                <div style={{ display: "grid", gap: 10 }}>
                    {(ticket?.attachments ?? []).map((a) => (
                        <div
                            key={a.id}
                            style={{
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: 12,
                                padding: 10,
                                display: "grid",
                                gap: 6,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                <div style={{ fontWeight: 900 }}>
                                    #{a.id} • {a.fileName}
                                </div>

                                <button
                                    onClick={() => void deleteAttachment(a.id)}
                                    style={{
                                        borderRadius: 10,
                                        padding: "8px 10px",
                                        border: "1px solid rgba(255,120,120,0.25)",
                                        background: "rgba(255,120,120,0.10)",
                                        color: "inherit",
                                        cursor: "pointer",
                                        fontWeight: 900,
                                    }}
                                    title="Удалить вложение"
                                >
                                    Delete
                                </button>
                            </div>

                            <a
                                href={a.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "inherit", textDecoration: "underline", opacity: 0.85, wordBreak: "break-all" }}
                            >
                                {a.fileUrl}
                            </a>
                        </div>
                    ))}
                </div>
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