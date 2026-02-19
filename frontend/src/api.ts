import { API_BASE_URL } from "./config";

export type ApiError = {
    status: number;
    message: string;
    details?: string;
};

let onError: ((err: ApiError) => void) | null = null;

// чтобы UI мог подписаться и показывать баннер/тост
export function setApiErrorHandler(handler: (err: ApiError) => void) {
    onError = handler;
}

// анти-спам в консоль: одинаковое сообщение не чаще чем раз в 5с
const lastLog: Record<string, number> = {};
const LOG_WINDOW_MS = 5000;

function logOnce(key: string, err: unknown) {
    const now = Date.now();
    if (!lastLog[key] || now - lastLog[key] > LOG_WINDOW_MS) {
        lastLog[key] = now;
        console.error(err);
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`;

    try {
        const res = await fetch(url, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers || {}),
            },
        });

        if (!res.ok) {
            const raw = await res.text().catch(() => "");
            let msg = raw || res.statusText || "Request failed";

            try {
                const parsed = JSON.parse(raw);
                if (parsed?.message) msg = String(parsed.message);
            } catch {
                // не JSON оставляем как есть
            }

            const err: ApiError = {
                status: res.status,
                message: msg,
                details: raw || undefined,
            };

            if (res.status === 401) err.message = "Не авторизован (401)";
            if (res.status === 403) err.message = "Доступ запрещён (403)";
            if (res.status >= 500) err.message = "Ошибка сервера (5xx)";

            onError?.(err);
            logOnce(`${res.status}:${path}:${err.message}`, err);
            throw err;
        }

        if (res.status === 204) return undefined as T;

        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
            // вдруг backend вернул текст/пусто
            return (await res.text()) as unknown as T;
        }

        return (await res.json()) as T;
    } catch (e) {
        // network error / CORS / server down
        if (typeof e === "object" && e && "status" in e) throw e;

        const err: ApiError = {
            status: 0,
            message: "Нет связи с сервером",
            details: String(e),
        };
        onError?.(err);
        logOnce(`network:${path}`, err);
        throw err;
    }
}

export const api = {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
