import type { ApiError } from "../api";

export default function ErrorBanner({
                                        error,
                                        onClose,
                                    }: {
    error: ApiError | null;
    onClose: () => void;
}) {
    if (!error) return null;

    return (
        <div
            style={{
        position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(255, 80, 80, 0.15)",
            border: "1px solid rgba(255, 80, 80, 0.35)",
            backdropFilter: "blur(10px)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            zIndex: 9999,
    }}
>
    <div style={{ flex: 1 }}>
    <div style={{ fontWeight: 700 }}>Ошибка</div>
    <div style={{ opacity: 0.9 }}>
    {error.message} {error.status ? `(status ${error.status})` : ""}
    </div>
    </div>
    <button
    onClick={onClose}
    style={{
        borderRadius: 10,
            padding: "8px 10px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
            cursor: "pointer",
    }}
>
    OK
    </button>
    </div>
);
}
