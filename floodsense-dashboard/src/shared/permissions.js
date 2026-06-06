// ─── src/shared/permissions.js ────────────────────────────────────────────────
export const rolePages = {
    admin: [
        { name: "Dashboard", path: "/app/dashboard" },
        { name: "Users", path: "/app/users" },
        { name: "Reports", path: "/app/reports" },
        { name: "Alerts", path: "/app/alerts" },
        { name: "Map View", path: "/app/mapview" },
        { name: "Prediction", path: "/app/prediction" },
        { name: "Add Location", path: "/app/addlocation" },

        // Move both Manage section items here together at the bottom
        { name: "Settings", path: "/app/settings" },
        { name: "Account", path: "/app/profile" },
    ],

    maintenance: [
        { name: "Dashboard", path: "/app/dashboard" },

        // Move both Manage section items here together at the bottom
        { name: "Settings", path: "/app/settings" },
        { name: "Account", path: "/app/profile" },
    ],
};