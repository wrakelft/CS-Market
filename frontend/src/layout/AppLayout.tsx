import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: "block",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: "inherit",
    background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
});

const btnSmall: React.CSSProperties = {
    borderRadius: 10,
    padding: "8px 10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    cursor: "pointer",
};

export default function AppLayout() {
    const { user, logout } = useAuth(); // ✅ hook внутри компонента

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",          // ✅ вместо 97.3vw
                maxWidth: "100%",
                overflowX: "hidden",    // ✅ чтобы не появлялся горизонтальный скролл
                boxSizing: "border-box",
                display: "grid",
                gridTemplateRows: "64px 1fr",
            }}
        >
            {/* Header */}
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ fontWeight: 700 }}>CS Market</div>
                <div style={{ opacity: 0.8, fontSize: 14 }}>Stage 4 vibes 🚀</div>
            </header>

            {/* Body */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "240px minmax(0, 1fr)",
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
                {/* Sidebar */}
                <aside
                    style={{
                        padding: 12,
                        borderRight: "1px solid rgba(255,255,255,0.08)",
                        boxSizing: "border-box",
                    }}
                >
                    <nav style={{ display: "grid", gap: 6 }}>
                        <NavLink to="/" end style={linkStyle}>
                            Home
                        </NavLink>
                        <NavLink to="/market" style={linkStyle}>
                            Market
                        </NavLink>
                        <NavLink to="/cart" style={linkStyle}>
                            Cart
                        </NavLink>
                        <NavLink to="/rent" style={linkStyle}>
                            Rent
                        </NavLink>
                        <NavLink to="/payments" style={linkStyle}>
                            Payments
                        </NavLink>
                        <NavLink to="/support" style={linkStyle}>
                            Support
                        </NavLink>
                        <NavLink to="/admin" style={linkStyle}>
                            Admin
                        </NavLink>
                    </nav>
                </aside>

                {/* Page content */}
                <main style={{ padding: 20, minWidth: 0, boxSizing: "border-box" }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
