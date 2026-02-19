import { API_BASE_URL } from "../config";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        ...init,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return undefined as T;

    return res.json() as Promise<T>;
}
