export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const POSTS_API = `${API_BASE_URL}/posts`;

// ─── USER MANAGEMENT ENDPOINTS ──────────────────────────────────────────────
export const USERS_API = `${API_BASE_URL}/users`;
export const AREAS_API = `${API_BASE_URL}/areas`;
export const ROLES_API = `${API_BASE_URL}/roles`;

// ─── ALERT SYSTEM ENDPOINTS ─────────────────────────────────────────────────
export const ALERTS_ACTIVE_API = `${API_BASE_URL}/alerts/active`;
export const ALERTS_HISTORY_API = `${API_BASE_URL}/alerts/history`;
export const THRESHOLDS_API = `${API_BASE_URL}/alert-thresholds`;

// ─── PREDICTION ENDPOINTS ────────────────────────────────────────────────────
export const PREDICTIONS_ALERTS_API = `${API_BASE_URL}/predictions/alerts`;
export const PREDICTIONS_LATEST_API = `${API_BASE_URL}/predictions/latest`;

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const DASHBOARD_MASTER_API = `${API_BASE_URL}/dashboard/master-telemetry`;

// ─── SAFE LOCATIONS ──────────────────────────────────────────────────────────
export const SAFE_LOCATIONS_API = `${API_BASE_URL}/safelocations`;

// ─── EXTERNAL STATION DATA ───────────────────────────────────────────────────
export const STATIONS_LATEST_API = "https://www.srilankafloodmonitor.site/api/levels/latest";

// ─── WEATHER API ─────────────────────────────────────────────────────────────
export const WEATHER_API = {
  KEY: "a201c7373afb43ff960185608250512",
  BASE_URL: "https://api.weatherapi.com/v1",
  RATNAPURA_COORDS: "6.6828,80.3992",
};

// ─── EMERGENCY MODE ───────────────────────────────────────────────────────────
export const EMERGENCY_TOGGLE_API = `${API_BASE_URL}/emergency/toggle`;