import React, { useEffect, useMemo, useState } from "react";
import type { User } from "./types";
import { AuthContext } from "./authContext";
import { authApi } from "./api";
import { clearToken, getToken, setToken } from "./tokenStorage";
import { setApiUnauthorizedHandler } from "../api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [initializing, setInitializing] = useState<boolean>(() => !!getToken());

    useEffect(() => {
        setApiUnauthorizedHandler(() => {
            clearToken();
            setUserState(null);
            setInitializing(false);
        });

        const token = getToken();
        if (!token) {
            setInitializing(false);
            return;
        }

        authApi.me()
            .then((u) => setUserState(u))
            .catch(() => {
                clearToken();
                setUserState(null);
            })
            .finally(() => setInitializing(false));
    }, []);

    const login = (token: string, u: User) => {
        setToken(token);
        setUserState(u);
    };

    const logout = () => {
        authApi.logout().catch(() => {});
        clearToken();
        setUserState(null);
    };

    const value = useMemo(() => ({ user, initializing, login, logout }), [user, initializing]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}