import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import StubPage from "./pages/StubPage";
import NotFound from "./pages/NotFound";

import ErrorBanner from "./components/ErrorBanner";
import { setApiErrorHandler } from "./api";
import type { ApiError } from "./api";

export default function App() {
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        setApiErrorHandler((e) => setError(e));
    }, []);

    return (
        <>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="market" element={<StubPage title="Market" />} />
                    <Route path="cart" element={<StubPage title="Cart" />} />
                    <Route path="rent" element={<StubPage title="Rent" />} />
                    <Route path="payments" element={<StubPage title="Payments" />} />
                    <Route path="support" element={<StubPage title="Support" />} />
                    <Route path="admin" element={<StubPage title="Admin" />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>

            <ErrorBanner error={error} onClose={() => setError(null)} />
        </>
    );
}
