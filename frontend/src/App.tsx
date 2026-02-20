import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import StubPage from "./pages/StubPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RequireAuth from "./auth/RequireAuth";


import ErrorBanner from "./components/ErrorBanner";
import { setApiErrorHandler } from "./api";
import type { ApiError } from "./api";
import MarketSale from "./pages/MarketSale";

export default function App() {
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        setApiErrorHandler((e) => setError(e));
    }, []);

    return (
        <>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route index element={<Home />} />
                    <Route path="market" element={
                        <RequireAuth><StubPage title="Market" /></RequireAuth>
                    } />
                    <Route path="cart" element={
                        <RequireAuth><StubPage title="Cart" /></RequireAuth>
                    } />
                    <Route path="rent" element={
                        <RequireAuth><StubPage title="Rent" /></RequireAuth>
                    } />
                    <Route path="payments" element={
                        <RequireAuth><StubPage title="Payments" /></RequireAuth>
                    } />
                    <Route path="support" element={
                        <RequireAuth><StubPage title="Support" /></RequireAuth>
                    } />
                    <Route path="admin" element={
                        <RequireAuth><StubPage title="Admin" /></RequireAuth>
                    } />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>

            <ErrorBanner error={error} onClose={() => setError(null)} />
        </>
    );
}
