// Base URL
export const API_BASE_URL = "http://127.0.0.1:8000/api";

// Endpoints
export const POSTS_API = `${API_BASE_URL}/posts`;

// ── Flood Monitor Station API ──
export const STATION_API = (name) =>
  `https://www.srilankafloodmonitor.site/api/stations/${name}`;
