import axiosInstance from "../axios";

const BASE = "/emergency";

// ── Toggle emergency mode and send FCM notifications ─────────────────────────
export const toggleEmergency = (isEmergency) =>
    axiosInstance.post(`${BASE}/toggle`, {
        is_emergency: isEmergency,
    });