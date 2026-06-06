import axiosInstance from "../axios";

const BASE = "/safe-locations";

// ── GET all safe locations ────────────────────────────────────────────────────
export const fetchSafeLocations = () =>
    axiosInstance.get(BASE);

// ── GET single safe location ──────────────────────────────────────────────────
export const fetchSafeLocation = (id) =>
    axiosInstance.get(`${BASE}/${id}`);

// ── POST create safe location ─────────────────────────────────────────────────
export const createSafeLocation = (payload) =>
    axiosInstance.post(BASE, payload);

// ── PUT update safe location ──────────────────────────────────────────────────
export const updateSafeLocation = (id, payload) =>
    axiosInstance.put(`${BASE}/${id}`, payload);

// ── DELETE safe location ──────────────────────────────────────────────────────
export const deleteSafeLocation = (id) =>
    axiosInstance.delete(`${BASE}/${id}`);
