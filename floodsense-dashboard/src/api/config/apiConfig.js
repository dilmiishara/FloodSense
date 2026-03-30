export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const POSTS_API = `${API_BASE_URL}/posts`;

// ─── USER MANAGEMENT ENDPOINTS ──────────────────────────────────────────────
export const USERS_API = `${API_BASE_URL}/users`;
export const AREAS_API = `${API_BASE_URL}/areas`;
export const ROLES_API = `${API_BASE_URL}/roles`;


// ─── ALERT SYSTEM ENDPOINTS ──────────────────────────────────────────────
export const ALERTS_ACTIVE_API = `${API_BASE_URL}/alerts/active`;
export const ALERTS_HISTORY_API = `${API_BASE_URL}/alerts/history`;
export const THRESHOLDS_API = `${API_BASE_URL}/alert-thresholds`;


// ── Only this one API is used for station data ──
export const STATIONS_LATEST_API = "https://www.srilankafloodmonitor.site/api/levels/latest";