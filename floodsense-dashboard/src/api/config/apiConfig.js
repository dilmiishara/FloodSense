export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const POSTS_API = `${API_BASE_URL}/posts`;

// ─── USER MANAGEMENT ENDPOINTS ──────────────────────────────────────────────
export const USERS_API = `${API_BASE_URL}/users`;
export const AREAS_API = `${API_BASE_URL}/areas`;
export const ROLES_API = `${API_BASE_URL}/roles`;

// ── Only this one API is used for station data ──
export const STATIONS_LATEST_API = "https://www.srilankafloodmonitor.site/api/levels/latest";

export const WEATHER_API = {
  KEY: "a201c7373afb43ff960185608250512",
  BASE_URL: "https://api.weatherapi.com/v1",
  RATNAPURA_COORDS: "6.6828,80.3992",
};