// ─── App.jsx ─────────────────────────────────────────────────────────────────
// Root component — import this in your React project entry point (e.g. main.jsx).
// All pages are lazily rendered based on the `page` state value.
//
// File structure expected:
//   src/
//     App.jsx          ← this file
//     shared.jsx       ← theme, tokens, reusable components
//     Dashboard.jsx
//     MapView.jsx
//     Alerts.jsx
//     Prediction.jsx
//     AddLocation.jsx
//     Reports.jsx
//     Settings.jsx
//     Logout.jsx

import { useState } from "react";
import MapView     from "./pages/MapView.jsx";
import Dashboard   from "./pages/Dashboard.jsx";
import Alerts from "./pages/Alerts.jsx";
import Reports from "./pages/Reports.jsx";
import Prediction  from "./pages/Prediction.jsx";
import Settings from "./pages/Settings.jsx";
import AddLocation from "./pages/AddLocation.jsx";
import Logout from "./pages/Logout.jsx";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard:   Dashboard,
    alerts: Alerts,
       prediction:  Prediction,
        mapview:     MapView,
        settings:    Settings,
        reports: Reports,
      addlocation: AddLocation,
      logout: Logout,
  };

  const PageComponent = pages[page] ?? Dashboard;

  return <PageComponent page={page} setPage={setPage} />;
}