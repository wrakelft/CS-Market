import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";
import type {JSX} from "react";

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const { user, initializing } = useAuth();
    const location = useLocation();

    if (initializing) return <div style={{ opacity: 0.8 }}>Checking session...</div>;

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    return children;
}
