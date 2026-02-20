import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RequireAuth from "./auth/RequireAuth";

import ErrorBanner from "./components/ErrorBanner";
import { setApiErrorHandler } from "./api";
import type { ApiError } from "./api";

import MarketSale from "./pages/MarketSale";
import CartPage from "./pages/CartPage.tsx";
import PaymentsPage from "./pages/PaymentPage";
import SupportPage from "./pages/SupportPage";
import TicketPage from "./pages/TicketPage";
import DeletionRequestsPage from "./pages/DeletionRequestPage";
import AdminPage from "./pages/AdminPage";
import MarketRent from "./pages/RentMarketPage.tsx";


import InventorySellPage from "./pages/InventorySellPage";
import MySalesPage from "./pages/MySalesPage";

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

                    {/* public */}
                    <Route path="login" element={<Login />} />

                    {/* protected */}
                    <Route
                        path="market"
                        element={
                            <RequireAuth>
                                <MarketSale />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="cart"
                        element={
                            <RequireAuth>
                                <CartPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="rent"
                        element={
                            <RequireAuth>
                                <MarketRent />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="payments"
                        element={
                            <RequireAuth>
                                <PaymentsPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="inventory"
                        element={
                            <RequireAuth>
                                <InventorySellPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="my-sales"
                        element={
                            <RequireAuth>
                                <MySalesPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="support"
                        element={
                            <RequireAuth>
                                <SupportPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="tickets/:id"
                        element={
                            <RequireAuth>
                                <TicketPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="admin"
                        element={
                            <RequireAuth>
                                <AdminPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="deletion-requests"
                        element={
                            <RequireAuth>
                                <DeletionRequestsPage />
                            </RequireAuth>
                        }
                    />

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>

            <ErrorBanner error={error} onClose={() => setError(null)} />
        </>
    );
}