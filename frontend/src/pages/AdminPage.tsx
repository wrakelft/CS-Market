import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";
import { Link } from "react-router-dom";

type Tab = "USERS" | "DELETIONS" | "INSTANT" | "TICKETS";

type AdminUser = {
    id: number;
    steamId: string;
    nickname: string;
    role: string; // "USER" | "ADMIN"
    balance?: number;
    createdAt?: string;
};

type DeletionRequest = {
    id: number;
    userId: number;
    status: string; // PENDING / APPROVED / REJECTED / CANCELLED
    reason?: string | null;
    createdAt?: string;
    decidedAt?: string;
    decidedBy?: number | null;
};

type RejectBody = { reason: string };

type InstantPriceReq = { skinId: number; price: number };

// ---- TICKETS ----
type TicketStatus = "OPEN" | "WAITING_INFO" | "CLOSED" | string;

type Attachment = {
    id: number;
    fileName: string;
    fileUrl: string;
};

type AdminTicket = {
    id: number;
    topic: string;
    description: string;
    userId: number;
    status: TicketStatus;
    createdAt?: string;
    closedAt?: string;
    attachments?: Attachment[];
};

const btn: React.CSSProperties = {
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    cursor: "pointer",
    height: 40,
};

const inputLike: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "inherit",
    outline: "none",
};

const card: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 12,
};

const pillBase: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
};

function pillStatus(s: string): React.CSSProperties {
    const v = String(s).toUpperCase();
    if (v === "PENDING") return { border: "1px solid rgba(160,160,255,0.35)", background: "rgba(160,160,255,0.10)" };
    if (v === "APPROVED") return { border: "1px solid rgba(120,255,120,0.35)", background: "rgba(120,255,120,0.10)" };
    if (v === "REJECTED") return { border: "1px solid rgba(255,120,120,0.35)", background: "rgba(255,120,120,0.10)" };
    if (v === "CANCELLED") return { border: "1px solid rgba(255,180,80,0.35)", background: "rgba(255,180,80,0.10)" };
    if (v === "ADMIN") return { border: "1px solid rgba(160,160,255,0.35)", background: "rgba(160,160,255,0.10)" };
    if (v === "USER") return { border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)" };
    return { border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)" };
}

function pillTicketStatus(s: string): React.CSSProperties {
    const v = String(s).toUpperCase();
    if (v === "OPEN") return { border: "1px solid rgba(160,160,255,0.35)", background: "rgba(160,160,255,0.10)" };
    if (v === "WAITING_INFO") return { border: "1px solid rgba(255,180,80,0.35)", background: "rgba(255,180,80,0.12)" };
    if (v === "CLOSED") return { border: "1px solid rgba(120,255,120,0.35)", background: "rgba(120,255,120,0.10)" };
    return { border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)" };
}

export default function AdminPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [tab, setTab] = useState<Tab>("USERS");
    const [msg, setMsg] = useState<string | null>(null);

    // USERS
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [roleSavingId, setRoleSavingId] = useState<number | null>(null);

    // DELETIONS
    const [deletions, setDeletions] = useState<DeletionRequest[]>([]);
    const [delLoading, setDelLoading] = useState(false);
    const [rejectReasonById, setRejectReasonById] = useState<Record<number, string>>({});
    const [actionId, setActionId] = useState<number | null>(null);

    // INSTANT PRICES
    const [skinIdStr, setSkinIdStr] = useState("");
    const [priceStr, setPriceStr] = useState("");
    const [instantSaving, setInstantSaving] = useState(false);

    // TICKETS
    const [tickets, setTickets] = useState<AdminTicket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [ticketActionId, setTicketActionId] = useState<number | null>(null);

    const parsePosInt = (v: string) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return null;
        const i = Math.floor(n);
        return i > 0 ? i : null;
    };

    const skinId = useMemo(() => parsePosInt(skinIdStr), [skinIdStr]);
    const price = useMemo(() => parsePosInt(priceStr), [priceStr]);

    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await api.get<AdminUser[]>("/admin/users");
            setUsers(data ?? []);
        } finally {
            setUsersLoading(false);
        }
    };

    const loadDeletions = async () => {
        setDelLoading(true);
        try {
            const data = await api.get<DeletionRequest[]>("/admin/deletion-requests");
            setDeletions(data ?? []);
        } finally {
            setDelLoading(false);
        }
    };

    const loadTickets = async () => {
        setTicketsLoading(true);
        try {
            const data = await api.get<AdminTicket[]>("/admin/tickets");
            setTickets(data ?? []);
        } finally {
            setTicketsLoading(false);
        }
    };

    useEffect(() => {
        setMsg(null);
        if (!isAdmin) return;

        if (tab === "USERS") void loadUsers();
        if (tab === "DELETIONS") void loadDeletions();
        if (tab === "TICKETS") void loadTickets();
    }, [tab, isAdmin]);

    if (!user) return <div style={{ opacity: 0.85 }}>Нужно войти в аккаунт.</div>;
    if (!isAdmin) return <div style={{ opacity: 0.85 }}>403 • Тут только для админов 👮‍♂️</div>;

    async function setUserRole(userId: number, role: "USER" | "ADMIN") {
        setRoleSavingId(userId);
        setMsg(null);
        try {
            const updated = await api.patch<AdminUser>(`/admin/users/${userId}/role?role=${role}`, {});
            setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
            setMsg(`Роль обновлена: userId=${userId} → ${updated.role}`);
        } finally {
            setRoleSavingId(null);
        }
    }

    async function approveDeletion(id: number) {
        setActionId(id);
        setMsg(null);
        try {
            const updated = await api.patch<DeletionRequest>(`/admin/deletion-requests/${id}/approve`, {});
            setDeletions((prev) => prev.map((x) => (x.id === id ? updated : x)));
            setMsg(`Approved deletion request #${id}`);
        } finally {
            setActionId(null);
        }
    }

    async function rejectDeletion(id: number) {
        const reason = (rejectReasonById[id] ?? "").trim();
        if (!reason) {
            setMsg("Для reject нужен reason (хотя бы пару слов).");
            return;
        }

        setActionId(id);
        setMsg(null);
        try {
            const updated = await api.patch<DeletionRequest>(`/admin/deletion-requests/${id}/reject`, { reason } as RejectBody);
            setDeletions((prev) => prev.map((x) => (x.id === id ? updated : x)));
            setMsg(`Rejected deletion request #${id}`);
        } finally {
            setActionId(null);
        }
    }

    async function saveInstantPrice() {
        if (!skinId || !price) return;

        setInstantSaving(true);
        setMsg(null);
        try {
            await api.post("/admin/instant-prices", { skinId, price } as InstantPriceReq);
            setMsg(`Instant price saved: skinId=${skinId} price=${price}₽`);
            setSkinIdStr("");
            setPriceStr("");
        } finally {
            setInstantSaving(false);
        }
    }

    async function setTicketStatus(ticketId: number, status: "OPEN" | "WAITING_INFO" | "CLOSED") {
        setTicketActionId(ticketId);
        setMsg(null);
        try {
            const updated = await api.patch<AdminTicket>(`/admin/tickets/${ticketId}/status?status=${status}`, {});
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setMsg(`Ticket #${ticketId} → ${status}`);
        } finally {
            setTicketActionId(null);
        }
    }

    return (
        <div style={{ display: "grid", gap: 14, maxWidth: 1100 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, lineHeight: 1.05 }}>Admin</h1>
                <div style={{ opacity: 0.75, fontSize: 13 }}>панель управления (тут можно случайно стать главным злодеем)</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                    onClick={() => setTab("USERS")}
                    style={{
                        ...btn,
                        borderRadius: 999,
                        fontWeight: 900,
                        background: tab === "USERS" ? "rgba(160,160,255,0.12)" : "rgba(255,255,255,0.04)",
                        borderColor: tab === "USERS" ? "rgba(160,160,255,0.30)" : "rgba(255,255,255,0.12)",
                    }}
                >
                    Users / Roles
                </button>

                <button
                    onClick={() => setTab("DELETIONS")}
                    style={{
                        ...btn,
                        borderRadius: 999,
                        fontWeight: 900,
                        background: tab === "DELETIONS" ? "rgba(255,180,80,0.12)" : "rgba(255,255,255,0.04)",
                        borderColor: tab === "DELETIONS" ? "rgba(255,180,80,0.30)" : "rgba(255,255,255,0.12)",
                    }}
                >
                    Deletion requests
                </button>

                <button
                    onClick={() => setTab("TICKETS")}
                    style={{
                        ...btn,
                        borderRadius: 999,
                        fontWeight: 900,
                        background: tab === "TICKETS" ? "rgba(160,160,255,0.12)" : "rgba(255,255,255,0.04)",
                        borderColor: tab === "TICKETS" ? "rgba(160,160,255,0.30)" : "rgba(255,255,255,0.12)",
                    }}
                >
                    Tickets
                </button>

                <button
                    onClick={() => setTab("INSTANT")}
                    style={{
                        ...btn,
                        borderRadius: 999,
                        fontWeight: 900,
                        background: tab === "INSTANT" ? "rgba(120,255,120,0.12)" : "rgba(255,255,255,0.04)",
                        borderColor: tab === "INSTANT" ? "rgba(120,255,120,0.30)" : "rgba(255,255,255,0.12)",
                    }}
                >
                    Instant prices
                </button>
            </div>

            {msg && (
                <div style={{ ...card, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)" }}>
                    {msg}
                </div>
            )}

            {/* USERS */}
            {tab === "USERS" && (
                <div style={{ ...card, display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontWeight: 900 }}>Users</div>
                        <button onClick={() => void loadUsers()} disabled={usersLoading} style={btn}>
                            {usersLoading ? "Loading..." : "Refresh"}
                        </button>
                    </div>

                    {!usersLoading && users.length === 0 && <div style={{ opacity: 0.8 }}>Пусто</div>}

                    <div style={{ display: "grid", gap: 8 }}>
                        {users.map((u) => {
                            const busy = roleSavingId === u.id;
                            return (
                                <div
                                    key={u.id}
                                    style={{
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: 12,
                                        padding: 12,
                                        display: "grid",
                                        gap: 8,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                        <div style={{ fontWeight: 900 }}>
                                            {u.nickname} <span style={{ opacity: 0.6, fontSize: 12 }}>#{u.id}</span>
                                        </div>
                                        <span style={{ ...pillBase, ...pillStatus(u.role) }}>{u.role}</span>
                                    </div>

                                    <div style={{ opacity: 0.75, fontSize: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <span>steamId: {u.steamId}</span>
                                        {typeof u.balance === "number" && <span>balance: {u.balance}₽</span>}
                                        {u.createdAt && <span>created: {u.createdAt}</span>}
                                    </div>

                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <button
                                            onClick={() => void setUserRole(u.id, "USER")}
                                            disabled={busy || u.role === "USER"}
                                            style={{
                                                ...btn,
                                                height: 38,
                                                opacity: busy || u.role === "USER" ? 0.6 : 1,
                                                cursor: busy || u.role === "USER" ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            Make USER
                                        </button>

                                        <button
                                            onClick={() => void setUserRole(u.id, "ADMIN")}
                                            disabled={busy || u.role === "ADMIN"}
                                            style={{
                                                ...btn,
                                                height: 38,
                                                border: "1px solid rgba(160,160,255,0.30)",
                                                background: "rgba(160,160,255,0.10)",
                                                opacity: busy || u.role === "ADMIN" ? 0.6 : 1,
                                                cursor: busy || u.role === "ADMIN" ? "not-allowed" : "pointer",
                                                fontWeight: 900,
                                            }}
                                        >
                                            Make ADMIN
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* DELETIONS */}
            {tab === "DELETIONS" && (
                <div style={{ ...card, display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontWeight: 900 }}>Deletion requests</div>
                        <button onClick={() => void loadDeletions()} disabled={delLoading} style={btn}>
                            {delLoading ? "Loading..." : "Refresh"}
                        </button>
                    </div>

                    {!delLoading && deletions.length === 0 && <div style={{ opacity: 0.8 }}>Запросов нет</div>}

                    <div style={{ display: "grid", gap: 8 }}>
                        {deletions.map((r) => {
                            const isPending = String(r.status).toUpperCase() === "PENDING";
                            const busy = actionId === r.id;

                            return (
                                <div
                                    key={r.id}
                                    style={{
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: 12,
                                        padding: 12,
                                        display: "grid",
                                        gap: 10,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                        <div style={{ fontWeight: 900 }}>
                                            #{r.id} <span style={{ opacity: 0.65, fontSize: 12 }}>userId={r.userId}</span>
                                        </div>
                                        <span style={{ ...pillBase, ...pillStatus(r.status) }}>{r.status}</span>
                                    </div>

                                    <div style={{ opacity: 0.75, fontSize: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        {r.createdAt && <span>created: {r.createdAt}</span>}
                                        {r.decidedAt && <span>decided: {r.decidedAt}</span>}
                                        {r.decidedBy != null && <span>by: {r.decidedBy}</span>}
                                        {r.reason && <span>reason: {r.reason}</span>}
                                    </div>

                                    {isPending ? (
                                        <div style={{ display: "grid", gap: 10 }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center" }}>
                                                <input
                                                    placeholder="Reject reason..."
                                                    value={rejectReasonById[r.id] ?? ""}
                                                    onChange={(e) => setRejectReasonById((p) => ({ ...p, [r.id]: e.target.value }))}
                                                    style={inputLike}
                                                    disabled={busy}
                                                />

                                                <button
                                                    onClick={() => void approveDeletion(r.id)}
                                                    disabled={busy}
                                                    style={{
                                                        ...btn,
                                                        height: 40,
                                                        border: "1px solid rgba(120,255,120,0.35)",
                                                        background: "rgba(120,255,120,0.10)",
                                                        fontWeight: 900,
                                                        opacity: busy ? 0.6 : 1,
                                                        cursor: busy ? "not-allowed" : "pointer",
                                                    }}
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => void rejectDeletion(r.id)}
                                                    disabled={busy}
                                                    style={{
                                                        ...btn,
                                                        height: 40,
                                                        border: "1px solid rgba(255,120,120,0.35)",
                                                        background: "rgba(255,120,120,0.10)",
                                                        fontWeight: 900,
                                                        opacity: busy ? 0.6 : 1,
                                                        cursor: busy ? "not-allowed" : "pointer",
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ opacity: 0.75, fontSize: 13 }}>Решение уже принято — кнопок нет.</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TICKETS */}
            {tab === "TICKETS" && (
                <div style={{ ...card, display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontWeight: 900 }}>Tickets</div>
                        <button onClick={() => void loadTickets()} disabled={ticketsLoading} style={btn}>
                            {ticketsLoading ? "Loading..." : "Refresh"}
                        </button>
                    </div>

                    {!ticketsLoading && tickets.length === 0 && <div style={{ opacity: 0.8 }}>Тикетов нет</div>}

                    <div style={{ display: "grid", gap: 8 }}>
                        {tickets.map((t) => {
                            const busy = ticketActionId === t.id;
                            const st = String(t.status).toUpperCase();
                            const isClosed = st === "CLOSED";

                            return (
                                <div
                                    key={t.id}
                                    style={{
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: 12,
                                        padding: 12,
                                        display: "grid",
                                        gap: 10,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                        <div style={{ fontWeight: 900 }}>
                                            #{t.id} • {t.topic}{" "}
                                            <span style={{ opacity: 0.65, fontSize: 12 }}>userId={t.userId}</span>
                                        </div>
                                        <span style={{ ...pillBase, ...pillTicketStatus(t.status) }}>{t.status}</span>
                                    </div>

                                    <div style={{ opacity: 0.85, fontSize: 13, lineHeight: 1.3 }}>
                                        {t.description}
                                    </div>

                                    <div style={{ opacity: 0.75, fontSize: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        {t.createdAt && <span>created: {t.createdAt}</span>}
                                        {t.closedAt && <span>closed: {t.closedAt}</span>}
                                        {Array.isArray(t.attachments) && <span>attachments: {t.attachments.length}</span>}
                                    </div>

                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                        <Link
                                            to={`/tickets/${t.id}`}
                                            style={{
                                                ...btn,
                                                height: 38,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                textDecoration: "none",
                                            }}
                                        >
                                            Open
                                        </Link>

                                        <button
                                            onClick={() => void setTicketStatus(t.id, "WAITING_INFO")}
                                            disabled={busy || isClosed}
                                            style={{
                                                ...btn,
                                                height: 38,
                                                border: "1px solid rgba(255,180,80,0.35)",
                                                background: "rgba(255,180,80,0.10)",
                                                fontWeight: 900,
                                                opacity: busy || isClosed ? 0.6 : 1,
                                                cursor: busy || isClosed ? "not-allowed" : "pointer",
                                            }}
                                            title={isClosed ? "Тикет закрыт" : "Запросить доп. сведения"}
                                        >
                                            Request info
                                        </button>

                                        <button
                                            onClick={() => void setTicketStatus(t.id, "CLOSED")}
                                            disabled={busy || isClosed}
                                            style={{
                                                ...btn,
                                                height: 38,
                                                border: "1px solid rgba(120,255,120,0.35)",
                                                background: "rgba(120,255,120,0.10)",
                                                fontWeight: 900,
                                                opacity: busy || isClosed ? 0.6 : 1,
                                                cursor: busy || isClosed ? "not-allowed" : "pointer",
                                            }}
                                            title={isClosed ? "Уже закрыт" : "Закрыть тикет"}
                                        >
                                            Close
                                        </button>
                                    </div>

                                    {Array.isArray(t.attachments) && t.attachments.length > 0 && (
                                        <div style={{ display: "grid", gap: 6 }}>
                                            <div style={{ fontWeight: 900, opacity: 0.85, fontSize: 12 }}>Attachments</div>
                                            <div style={{ display: "grid", gap: 6 }}>
                                                {t.attachments.slice(0, 5).map((a) => (
                                                    <a
                                                        key={a.id}
                                                        href={a.fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ opacity: 0.85, fontSize: 13, color: "inherit" }}
                                                    >
                                                        {a.fileName}
                                                    </a>
                                                ))}
                                                {t.attachments.length > 5 && (
                                                    <div style={{ opacity: 0.65, fontSize: 12 }}>+{t.attachments.length - 5} more…</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* INSTANT */}
            {tab === "INSTANT" && (
                <div style={{ ...card, display: "grid", gap: 12, maxWidth: 860 }}>
                    <div style={{ fontWeight: 900 }}>Instant prices</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>skinId</div>
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={skinIdStr}
                                onChange={(e) => setSkinIdStr(e.target.value)}
                                style={inputLike}
                                placeholder="e.g. 12"
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>price</div>
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={priceStr}
                                onChange={(e) => setPriceStr(e.target.value)}
                                style={inputLike}
                                placeholder="₽"
                            />
                        </label>

                        <button
                            onClick={() => void saveInstantPrice()}
                            disabled={instantSaving || !skinId || !price}
                            style={{
                                ...btn,
                                height: 42,
                                border: "1px solid rgba(120,255,120,0.35)",
                                background: instantSaving || !skinId || !price ? "rgba(120,255,120,0.05)" : "rgba(120,255,120,0.12)",
                                fontWeight: 900,
                                opacity: instantSaving || !skinId || !price ? 0.7 : 1,
                                cursor: instantSaving || !skinId || !price ? "not-allowed" : "pointer",
                            }}
                            title={!skinId || !price ? "skinId и price должны быть > 0" : "Сохранить цену"}
                        >
                            {instantSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}