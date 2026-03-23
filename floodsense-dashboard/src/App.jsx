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
import Dashboard   from "./Dashboard";
import Alerts from "./Alerts";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard:   Dashboard,
    alerts: Alerts,
  };

  const PageComponent = pages[page] ?? Dashboard;

  return <PageComponent page={page} setPage={setPage} />;
}