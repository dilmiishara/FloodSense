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
import Logout from "./pages/Logout.jsx";
import Posts from "./pages/Posts.jsx";

// Auth
import Login from "./pages/Login";
import OfficerDashboard from "./pages/OfficerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function MainApp() {
  const [page, setPage] = useState("dashboard");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("API Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const pages = {
    dashboard: Dashboard,
    alerts: Alerts,
    prediction: Prediction,
    mapview: MapView,
    settings: Settings,
    reports: Reports,
    addlocation: AddLocation,
    logout: Logout,
    posts: Posts,
  };

  const PageComponent = pages[page] ?? Dashboard;

  return (
    <PageComponent
      page={page}
      setPage={setPage}
      posts={posts}
      loading={loading}
    />
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
          path="/dashboard"
          element={
            <ProtectedRoute role="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Officer Dashboard */}
        <Route
          path="/officer-dashboard"
          element={
            <ProtectedRoute role="officer">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Optional Main App */}
        <Route
          path="/app"
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