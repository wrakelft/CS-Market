import React, { useEffect, useMemo, useState } from "react";
import type { User } from "./types";
import { AuthContext } from "./authContext";
import { authApi } from "./api";
import { clearToken, getToken, setToken } from "./tokenStorage";
import { setApiUnauthorizedHandler } from "../api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);

    // initializing = true только если на старте есть токен
    const [initializing, setInitializing] = useState<boolean>(() => !!getToken());

    useEffect(() => {
        setApiUnauthorizedHandler(() => {
            clearToken();
            setUserState(null);
        });

        const token = getToken();

        if (!token) return;

        let alive = true;

        (async () => {
            try {
                const u = await authApi.me();
                if (alive) setUserState(u);
            } catch {
                clearToken();
                if (alive) setUserState(null);
            } finally {
                if (alive) setInitializing(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const login = (token: string, u: User) => {
        setToken(token);
        setUserState(u);
        setInitializing(false);
    };

    const logout = () => {
        authApi.logout().catch(() => {});
        clearToken();
        setUserState(null);
    };

    const refreshUser = async () => {
        const token = getToken();
        if (!token) {
            setUserState(null);
            return;
        }
        try {
            const u = await authApi.me(); // me() уже возвращает balance
            setUserState(u);
        } catch {
            clearToken();
            setUserState(null);
        }
    };

    const value = useMemo(
        () => ({ user, initializing, login, logout, refreshUser }),
        [user, initializing]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}