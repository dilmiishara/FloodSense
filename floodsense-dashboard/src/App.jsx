import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// API
import { fetchPosts } from "./api";

// Pages
import MapView from "./pages/MapView.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Alerts from "./pages/Alerts.jsx";
import Reports from "./pages/Reports.jsx";
import Prediction from "./pages/Prediction.jsx";
import Settings from "./pages/Settings.jsx";
import AddLocation from "./pages/AddLocation.jsx";
import Posts from "./pages/Posts.jsx";
import Users from "./pages/ManageUsers.jsx"
import { SettingsProvider } from './context/SettingsContext';

// Auth
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout
import { PageShell } from "./shared";

// ─── MAIN APP ─────────────────────────────────────
function MainApp() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts()
            .then((res) => setPosts(res.data))
            .catch((err) => console.error("API Error:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <PageShell>
            <Routes>
                {/* Admin only */}
                <Route path="alerts" element={
                    <ProtectedRoute role={1}>
                        <Alerts />
                    </ProtectedRoute>
                } />
                <Route path="Users" element={
                    <ProtectedRoute role={1}>
                        <Users />
                    </ProtectedRoute>
                } />

                <Route path="prediction" element={
                    <ProtectedRoute role={1}>
                        <Prediction />
                    </ProtectedRoute>
                } />

                <Route path="mapview" element={
                    <ProtectedRoute role={1}>
                        <MapView />
                    </ProtectedRoute>
                } />

                <Route path="reports" element={
                    <ProtectedRoute role={1}>
                        <Reports />
                    </ProtectedRoute>
                } />

                <Route path="addlocation" element={
                    <ProtectedRoute role={1}>
                        <AddLocation />
                    </ProtectedRoute>
                } />

                {/* Both roles */}
                <Route path="dashboard" element={
                    <ProtectedRoute>
                        <Dashboard posts={posts} loading={loading} />
                    </ProtectedRoute>
                } />

                <Route path="settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />

                <Route path="posts" element={
                    <ProtectedRoute>
                        <Posts posts={posts} loading={loading} />
                    </ProtectedRoute>
                } />

                {/* default redirect */}
                <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </PageShell>
    );
}

// ─── APP ROOT ─────────────────────────────────────
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login */}
                <Route path="/" element={<Login />} />

                {/* Protected App */}
                <Route
                    path="/app/*"
                    element={
                        <ProtectedRoute>
                              <SettingsProvider>
                                 <MainApp />
                            </SettingsProvider>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );


    
}