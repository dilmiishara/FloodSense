// ─── src/api/services/sensorNodeService.js ───────────────────────────────────
//  All API calls for Sensor Node CRUD.
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from "../axios";

const BASE = "/sensor-nodes";

// ── GET all nodes (optional filters) ─────────────────────────────────────────
// status: "active" | "inactive" | "maintenance" | "all"
// gateway_id: number (optional)
export const fetchSensorNodes = (params = {}) =>
    axiosInstance.get(BASE, { params });

// ── GET single node ───────────────────────────────────────────────────────────
export const fetchSensorNode = (id) =>
    axiosInstance.get(`${BASE}/${id}`);

// ── POST register new node ────────────────────────────────────────────────────
export const createSensorNode = (payload) =>
    axiosInstance.post(BASE, payload);
//  payload shape:
//  {
//    name:         "Ratnapura-A1",
//    lora_dev_eui: "70B3D57ED0050123",
//    lora_app_eui: "0000000000000001",
//    gateway_id:   1,
//    latitude:     6.6828,    // optional
//    longitude:    80.3992,   // optional
//    status:       "active",  // optional, defaults to active
//  }

// ── PUT update node ───────────────────────────────────────────────────────────
export const updateSensorNode = (id, payload) =>
    axiosInstance.put(`${BASE}/${id}`, payload);

// ── DELETE node → sets status to inactive ────────────────────────────────────
export const deleteSensorNode = (id) =>
    axiosInstance.delete(`${BASE}/${id}`);

// ── PATCH status actions ──────────────────────────────────────────────────────
export const activateSensorNode    = (id) => axiosInstance.patch(`${BASE}/${id}/activate`);
export const maintenanceSensorNode = (id) => axiosInstance.patch(`${BASE}/${id}/maintenance`);
export const pingSensorNode        = (id) => axiosInstance.patch(`${BASE}/${id}/ping`);
