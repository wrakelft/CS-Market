import { api } from "../api";
import type { User } from "./types";

export type AuthResponse = {
    token: string;
    user: User;
};

export type RegisterRequest = {
    steamId: string;
    nickname: string;
    password: string;
};

export type LoginRequest = {
    steamId: string;
    password: string;
};

export const authApi = {
    register: (body: RegisterRequest) => api.post<AuthResponse>("/auth/register", body),
    login: (body: LoginRequest) => api.post<AuthResponse>("/auth/login", body),
    me: () => api.get<User>("/auth/me"),
    logout: () => api.post<void>("/auth/logout"),
};