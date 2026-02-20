import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/authContext";

type RentalListingDto = {
    listingId: number;
    pricePerDay: number;
    maxDays: number;
    skinId: number;
    skinName: string;
    ownerId: number;
};

type RentRequestDto = {
    renterId: number;
    announcementId: number;
    days: number;
};

type RentResponseDto = {
    success: boolean;
    message: string;
    rentalContractId: number | null;
    totalCost: number | null;
};

export default function RentMarketPage() {
    const { user } = useAuth();
    const userId = user?.id ?? 0;

    const [items, setItems] = useState<RentalListingDto[]>([]);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState<RentalListingDto | null>(null);

    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return items.filter((x) => (qq ? x.skinName.toLowerCase().includes(qq) : true));
    }, [items, q]);

    async function load() {
        setLoading(true);
        try {
            const data = await api.get<RentalListingDto[]>("/listings/rent");
            setItems(data ?? []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    function onRentedOk(listingId: number) {
        // DoD: после аренды listing пропадает
        setItems((prev) => prev.filter((x) => x.listingId !== listingId));
        setOpen(null);
    }

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>
                    <h1 style={{ margin: 0, lineHeight: 1.05 }}>Rent market</h1>
                    <div style={{ opacity: 0.8, fontSize: 14, marginTop: 6, lineHeight: 1.9 }}>
                        {loading ? "Loading..." : `Listings: ${filtered.length}`}
                    </div>
                </div>

                <button
                    onClick={() => void load()}
                    disabled={loading}
                    style={btn}
                >
                    Refresh
                </button>
            </div>

            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by skin name..."
                style={input}
            />

            {!loading && filtered.length === 0 && (
                <div style={{ opacity: 0.8 }}>Пока нет доступных объявлений аренды</div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 420px))",
                    justifyContent: "start",
                    gap: 12,
                }}
            >
                {filtered.map((x) => (
                    <div key={x.listingId} style={card}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontWeight: 850 }}>{x.skinName}</div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 900, fontSize: 16 }}>{x.pricePerDay}₽/day</div>
                                <div style={{ opacity: 0.65, fontSize: 12 }}>max: {x.maxDays}d</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", opacity: 0.85, fontSize: 13 }}>
                            <span style={pill}>skinId: {x.skinId}</span>
                            <span style={pill}>ownerId: {x.ownerId}</span>
                            <span style={pill}>listingId: {x.listingId}</span>
                        </div>

                        <button
                            disabled={!userId}
                            onClick={() => setOpen(x)}
                            style={{
                                ...btnWide,
                                cursor: !userId ? "not-allowed" : "pointer",
                                opacity: !userId ? 0.65 : 1,
                            }}
                            title={!userId ? "Сначала войди в аккаунт" : undefined}
                        >
                            {!userId ? "Войдите чтобы арендовать" : "Rent"}
                        </button>
                    </div>
                ))}
            </div>

            {open && (
                <RentModal
                    listing={open}
                    renterId={userId}
                    onClose={() => setOpen(null)}
                    onOk={() => onRentedOk(open.listingId)}
                    onNeedReload={load}
                />
            )}
        </div>
    );
}

function RentModal({
                       listing,
                       renterId,
                       onClose,
                       onOk,
                       onNeedReload,
                   }: {
    listing: RentalListingDto;
    renterId: number;
    onClose: () => void;
    onOk: () => void;
    onNeedReload: () => void;
}) {
    const [days, setDays] = useState<number>(Math.min(1, listing.maxDays));
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const total = Math.max(0, days) * listing.pricePerDay;

    async function submit() {
        if (!renterId) return;
        const d = Math.floor(Number(days));
        if (!Number.isFinite(d) || d <= 0) {
            setMsg({ ok: false, text: "Дни должны быть > 0" });
            return;
        }
        if (d > listing.maxDays) {
            setMsg({ ok: false, text: `Максимум дней: ${listing.maxDays}` });
            return;
        }

        setSubmitting(true);
        setMsg(null);
        try {
            const body: RentRequestDto = {
                renterId,
                announcementId: listing.listingId,
                days: d,
            };

            const resp = await api.post<RentResponseDto>("/rent", body);

            if (resp?.success) {
                setMsg({
                    ok: true,
                    text: `Успех! contractId=${resp.rentalContractId ?? "?"}, cost=${resp.totalCost ?? total}₽`,
                });

                onOk();

                void onNeedReload();
            } else {
                setMsg({ ok: false, text: resp?.message ?? "Rent failed" });
            }
        } catch (e: unknown) {
        const msg =
            e instanceof Error
                ? e.message
                : typeof (e as { message?: unknown })?.message === "string"
                    ? (e as { message?: string }).message!
                    : "Rent failed";

        setMsg({ ok: false, text: msg });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={modalOverlay} onMouseDown={onClose}>
            <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.15 }}>{listing.skinName}</div>
                        <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
                            {listing.pricePerDay}₽/day • max {listing.maxDays} days
                        </div>
                    </div>
                    <button onClick={onClose} style={btnGhost} title="Close">
                        ✕
                    </button>
                </div>

                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    <label style={{ fontSize: 13, opacity: 0.85 }}>Days</label>
                    <input
                        type="number"
                        min={1}
                        max={listing.maxDays}
                        step={1}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        disabled={submitting}
                        style={input}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontWeight: 850 }}>
                            Total: {total}₽
                            <span style={{ opacity: 0.7, fontWeight: 500, marginLeft: 8, fontSize: 12 }}>
                (если всё ок — деньги спишутся/зачислятся в БД)
              </span>
                        </div>

                        <button onClick={() => void submit()} disabled={submitting} style={btn}>
                            {submitting ? "Renting..." : "Confirm"}
                        </button>
                    </div>

                    {msg && (
                        <div
                            style={{
                                marginTop: 6,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: `1px solid ${msg.ok ? "rgba(120,255,120,0.25)" : "rgba(255,120,120,0.25)"}`,
                                background: msg.ok ? "rgba(120,255,120,0.10)" : "rgba(255,120,120,0.10)",
                            }}
                        >
                            {msg.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const card: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 12,
    display: "grid",
    gap: 10,
};

const pill: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
};

const btn: React.CSSProperties = {
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    cursor: "pointer",
    height: 40,
    fontWeight: 800,
};

const btnWide: React.CSSProperties = {
    ...btn,
    width: "100%",
    borderRadius: 12,
};

const btnGhost: React.CSSProperties = {
    borderRadius: 10,
    padding: "8px 10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "inherit",
    cursor: "pointer",
    height: 36,
};

const input: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "inherit",
    outline: "none",
};

const modalOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
    padding: 14,
    zIndex: 50,
};

const modal: React.CSSProperties = {
    width: "min(560px, 96vw)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(20,20,20,0.92)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    padding: 14,
};