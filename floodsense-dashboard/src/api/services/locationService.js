import axiosInstance from "../axios";
import { SAFE_LOCATIONS_API } from "../config/apiConfig";

// ─── SAFE LOCATION API OPERATIONS ─────────────────────────────

// Get all locations
export const getAllLocations = () => {
    return axiosInstance.get(SAFE_LOCATIONS_API);
};

// Get single location by ID
export const getLocationById = (id) => {
    return axiosInstance.get(`${SAFE_LOCATIONS_API}/${id}`);
};

// Create new location
export const createLocation = (data) => {
    return axiosInstance.post(SAFE_LOCATIONS_API, data);
};

// Update location
export const updateLocation = (id, data) => {
    return axiosInstance.put(`${SAFE_LOCATIONS_API}/${id}`, data);
};

// Delete location
export const deleteLocation = (id) => {
    return axiosInstance.delete(`${SAFE_LOCATIONS_API}/${id}`);
};