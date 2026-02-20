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
        <div style={{ minHeight: "100vh", display: "grid", gridTemplateRows: "64px 1fr" }}>
            {/* Header */}
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <div style={{ fontWeight: 700 }}>CS Market</div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {user ? (
                        <>
              <span style={{ opacity: 0.85, fontSize: 14 }}>
                {user.nickname} · id {user.id}
              </span>
                            <button onClick={logout} style={btnSmall}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" style={{ opacity: 0.9, textDecoration: "none", color: "inherit" }}>
                            Login
                        </Link>
                    )}

                    <div style={{ opacity: 0.7, fontSize: 14 }}>Stage 4 vibes 🚀</div>
                </div>
            </header>

            {/* Body */}
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr" }}>
                {/* Sidebar */}
                <aside
                    style={{
                        padding: 12,
                        borderRight: "1px solid rgba(255,255,255,0.08)",
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
                <main style={{ padding: 20 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
