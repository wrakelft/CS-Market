import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function HomePage() {
    const { user } = useAuth();

    const quick = user
        ? [
            { to: "/market", title: "Market", desc: "Buy & sell skins быстро" },
            { to: "/rent", title: "Rent market", desc: "Арендуй скины на дни" },
            { to: "/inventory", title: "My inventory", desc: "Продай / сдай в аренду" },
            { to: "/my-sales", title: "My sales", desc: "Твои листинги и сделки" },
        ]
        : [
            { to: "/market", title: "Market", desc: "Посмотри что продают" },
            { to: "/rent", title: "Rent market", desc: "Посмотри аренду" },
        ];

    return (
        <div style={page}>
            <div style={bgGlow1} />
            <div style={bgGlow2} />

            <header style={hero}>
                <div style={{ display: "grid", gap: 10 }}>
                    <div style={badge}>⚡ skins • market • rent</div>

                    <h1 style={h1}>
                        Trade & Rent skins
                        <span style={{ opacity: 0.75 }}> как будто это 2030</span>
                    </h1>

                    <p style={p}>
                        Витрина, продажи, instant-сделки и аренда — всё в одном месте.
                        Без лишнего клика, только скорость.
                    </p>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                        <Link to="/market" style={{ ...btn, ...btnPrimary }}>
                            Go to Market →
                        </Link>
                        <Link to={user ? "/inventory" : "/login"} style={btn}>
                            {user ? "Open Inventory" : "Login"}
                        </Link>
                        <Link to="/rent" style={btn}>
                            Rent market
                        </Link>
                    </div>

                    {user && (
                        <div style={{ opacity: 0.8, fontSize: 13, marginTop: 6 }}>
                            Привет, <span style={{ fontWeight: 900 }}>{user.nickname ?? "user"}</span> 👋
                        </div>
                    )}
                </div>

                <div style={heroCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 14, opacity: 0.9 }}>Today’s vibe</div>
                            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                                меньше хаоса, больше сделок
                            </div>
                        </div>
                        <div style={chip}>LIVE</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                        <Stat title="Instant sell" value="1 click" hint="цена авто" />
                        <Stat title="Rent" value="days" hint="с таймером" />
                        <Stat title="Fees" value="low" hint="меньше потерь" />
                        <Stat title="Flow" value="smooth" hint="без лагов" />
                    </div>

                    <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12, lineHeight: 1.6 }}>

                    </div>
                </div>
            </header>

            <section style={grid2}>
                <div style={panel}>
                    <div style={panelTitle}>Quick actions</div>
                    <div style={cardsGrid}>
                        {quick.map((x) => (
                            <Link key={x.to} to={x.to} style={cardLink}>
                                <div style={{ fontWeight: 900 }}>{x.title}</div>
                                <div style={{ opacity: 0.7, fontSize: 13, marginTop: 6 }}>{x.desc}</div>
                                <div style={{ marginTop: 10, opacity: 0.9, fontWeight: 800 }}>Open →</div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div style={panel}>
                    <div style={panelTitle}>Features</div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <Feature
                            icon="💸"
                            title="Instant sell"
                            desc="Авто-цена и продажа в один клик"
                        />
                        <Feature
                            icon="🕒"
                            title="Rent system"
                            desc="Сдавай и арендуй скины"
                        />
                        <Feature
                            icon="🧾"
                            title="History"
                            desc="Транзакции и статусы — всё прозрачно"
                        />
                        <Feature
                            icon="🛡️"
                            title="Safe flow"
                            desc="Блокировки и проверки, чтобы не было гонок"
                        />
                    </div>
                </div>
            </section>

            <footer style={{ opacity: 0.65, fontSize: 12, marginTop: 6 }}>
            </footer>
        </div>
    );
}

function Stat(props: { title: string; value: string; hint: string }) {
    return (
        <div style={statBox}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{props.title}</div>
            <div style={{ fontSize: 18, fontWeight: 950, marginTop: 4 }}>{props.value}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{props.hint}</div>
        </div>
    );
}

function Feature(props: { icon: string; title: string; desc: string }) {
    return (
        <div style={feature}>
            <div style={featureIcon}>{props.icon}</div>
            <div>
                <div style={{ fontWeight: 900 }}>{props.title}</div>
                <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>{props.desc}</div>
            </div>
        </div>
    );
}

const page: React.CSSProperties = {
    position: "relative",
    padding: 18,
    display: "grid",
    gap: 14,
    overflow: "hidden",
};

const bgGlow1: React.CSSProperties = {
    position: "absolute",
    inset: "-20% -10% auto auto",
    width: 520,
    height: 520,
    background: "radial-gradient(circle at 30% 30%, rgba(120,170,255,0.35), transparent 60%)",
    filter: "blur(18px)",
    pointerEvents: "none",
};

const bgGlow2: React.CSSProperties = {
    position: "absolute",
    inset: "auto auto -30% -20%",
    width: 600,
    height: 600,
    background: "radial-gradient(circle at 30% 30%, rgba(120,255,180,0.22), transparent 60%)",
    filter: "blur(18px)",
    pointerEvents: "none",
};

const hero: React.CSSProperties = {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 14,
    alignItems: "stretch",
};

const badge: React.CSSProperties = {
    width: "fit-content",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    opacity: 0.9,
};

const h1: React.CSSProperties = {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.05,
    letterSpacing: -0.6,
    fontWeight: 950,
};

const p: React.CSSProperties = {
    margin: 0,
    opacity: 0.78,
    fontSize: 15,
    lineHeight: 1.7,
    maxWidth: 680,
};

const btn: React.CSSProperties = {
    borderRadius: 12,
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    textDecoration: "none",
    fontWeight: 850,
};

const btnPrimary: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(120,170,255,0.25), rgba(120,255,180,0.18))",
    border: "1px solid rgba(120,170,255,0.35)",
};

const heroCard: React.CSSProperties = {
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
};

const chip: React.CSSProperties = {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
};

const statBox: React.CSSProperties = {
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
};

const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: 14,
};

const panel: React.CSSProperties = {
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
};

const panelTitle: React.CSSProperties = {
    fontWeight: 950,
    marginBottom: 10,
    letterSpacing: -0.2,
};

const cardsGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
};

const cardLink: React.CSSProperties = {
    display: "block",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
    textDecoration: "none",
    transition: "transform 120ms ease",
};

const feature: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "38px 1fr",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
};

const featureIcon: React.CSSProperties = {
    width: 38,
    height: 38,
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 18,
};