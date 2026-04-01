import axiosInstance from "../axios";
import { USERS_API, AREAS_API , ROLES_API } from "../config/apiConfig";

// ─── USER OPERATIONS ─────────────────────────────────────────────────────────

// Get all users with their Area and Role relationships
export const fetchUsers = () => {
  return axiosInstance.get(USERS_API);
};

// Create a new user (Personnel Initialization)
export const saveUser = (data) => {
  return axiosInstance.post(USERS_API, data);
};

// Update existing user credentials or profile
export const updateUser = (id, data) => {
  return axiosInstance.put(`${USERS_API}/${id}`, data);
};

// Revoke user access (Delete)
export const deleteUser = (id) => {
  return axiosInstance.delete(`${USERS_API}/${id}`);
};

// ─── LOOKUP OPERATIONS ───────────────────────────────────────────────────────
export const fetchAreas = () => {
  return axiosInstance.get(AREAS_API);
};

export const fetchRoles = () => {
  return axiosInstance.get(ROLES_API);
};

export const fetchFieldOfficers = () => {
    return axiosInstance.get('/field-officers'); 
};