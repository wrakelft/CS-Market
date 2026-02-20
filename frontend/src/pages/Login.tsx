import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../auth/api";
import { useAuth } from "../auth/authContext";

export default function Login() {
    const [steamId, setSteamId] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from ?? "/";

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        const sid = steamId.trim();
        const nick = nickname.trim();

        if (!sid || !password.trim()) return;
        if (mode === "register" && !nick) return;

        setLoading(true);
        try {
            const resp =
                mode === "register"
                    ? await authApi.register({ steamId: sid, nickname: nick, password })
                    : await authApi.login({ steamId: sid, password });

            login(resp.token, resp.user);
            navigate(from, { replace: true });
        } finally {
            setLoading(false);
        }
    }

    const canSubmit =
        !!steamId.trim() &&
        !!password.trim() &&
        (mode === "login" || !!nickname.trim());

    return (
        <div style={{ maxWidth: 420 }}>
            <h1 style={{ marginTop: 0 }}>
                {mode === "login" ? "Login" : "Register"}
            </h1>
            <p style={{ opacity: 0.8 }}>
                {mode === "login"
                    ? "Вход по Steam ID + пароль"
                    : "Создание аккаунта (Steam ID + ник + пароль)"}
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                    type="button"
                    onClick={() => setMode("login")}
                    style={{
                        ...tabStyle,
                        background: mode === "login" ? "rgba(255,255,255,0.10)" : "transparent",
                    }}
                >
                    Login
                </button>
                <button
                    type="button"
                    onClick={() => setMode("register")}
                    style={{
                        ...tabStyle,
                        background: mode === "register" ? "rgba(255,255,255,0.10)" : "transparent",
                    }}
                >
                    Register
                </button>
            </div>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    <span>Steam ID</span>
                    <input
                        value={steamId}
                        onChange={(e) => setSteamId(e.target.value)}
                        placeholder="7656119..."
                        style={inputStyle}
                    />
                </label>

                {mode === "register" && (
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>Nickname</span>
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Wrakelftyy"
                            style={inputStyle}
                        />
                    </label>
                )}

                <label style={{ display: "grid", gap: 6 }}>
                    <span>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="минимум 6 символов"
                        style={inputStyle}
                    />
                </label>

                <button disabled={loading || !canSubmit} style={buttonStyle}>
                    {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
                </button>
            </form>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    outline: "none",
};

const buttonStyle: React.CSSProperties = {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.10)",
    color: "inherit",
    cursor: "pointer",
};

const tabStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    color: "inherit",
    cursor: "pointer",
};