
const BASE = "/gateways";
import axiosInstance from "../axios";

export const fetchGateways = (status = "") =>
    axiosInstance.get(BASE, { params: status ? { status } : {} });

export const fetchGateway = (id) =>
    axiosInstance.get(`${BASE}/${id}`);

export const createGateway = (payload) =>
    axiosInstance.post(BASE, payload);

export const updateGateway = (id, payload) =>
    axiosInstance.put(`${BASE}/${id}`, payload);

export const deleteGateway = (id) =>
    axiosInstance.delete(`${BASE}/${id}`);

export const activateGateway = (id) =>
    axiosInstance.patch(`${BASE}/${id}/activate`);

export const pingGateway = (id) =>
    axiosInstance.patch(`${BASE}/${id}/ping`);
