// permissions.js
export const rolePages = {
    admin: [
        { name: "Dashboard", path: "/app/dashboard" },
        { name: "Settings", path: "/app/settings" },
        { name: "Users", path: "/app/users" },
        { name: "Reports", path: "/app/reports" },
        { name: "Alerts", path: "/app/alerts" },
        { name: "Map View", path: "/app/mapview" },
        { name: "Prediction", path: "/app/prediction" },
        { name: "Add Location", path: "/app/addlocation" },
        { name: "Posts", path: "/app/posts" },
        { path: "/app/profile" },
    ],

    maintenance: [
        { name: "Dashboard", path: "/app/dashboard" },
        { name: "Settings", path: "/app/settings" },
        { name: "Posts", path: "/app/posts" },
        { path: "/app/profile" },
    ],
};