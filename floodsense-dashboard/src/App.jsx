import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// Auth
import Login from "./pages/Login";
import OfficerDashboard from "./pages/OfficerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Routes>
            <Route path="dashboard" element={<Dashboard posts={posts} loading={loading} />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="prediction" element={<Prediction />} />
            <Route path="mapview" element={<MapView />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="addlocation" element={<AddLocation />} />
            <Route path="posts" element={<Posts posts={posts} loading={loading} />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Login />} />

                {/* Admin Dashboard */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute role={1}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Officer Dashboard */}
                <Route
                    path="/officer/dashboard"
                    element={
                        <ProtectedRoute role={2}>
                            <OfficerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Optional Main App */}
                <Route
                    path="/app/*"
                    element={
                        <ProtectedRoute>
                            <MainApp />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}