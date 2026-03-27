// ─── App.jsx ───────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

// ✅ Import from service layer (professional way)
import { fetchPosts } from "./api";

// Pages
import MapView     from "./pages/MapView.jsx";
import Dashboard   from "./pages/Dashboard.jsx";
import Alerts      from "./pages/Alerts.jsx";
import Reports     from "./pages/Reports.jsx";
import Prediction  from "./pages/Prediction.jsx";
import Settings    from "./pages/Settings.jsx";
import AddLocation from "./pages/AddLocation.jsx";
import Logout      from "./pages/Logout.jsx";
import Posts       from "./pages/Posts.jsx";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from Laravel API (via service layer)
  useEffect(() => {
    fetchPosts()
      .then((res) => {
        setPosts(res.data);   // axios response → data
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
      posts={posts}       // ✅ API data
      loading={loading}   // ✅ loading state
    />
  );
}