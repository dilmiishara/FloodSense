import axiosInstance from "../axios";
import { ALERTS_ACTIVE_API, ALERTS_HISTORY_API, THRESHOLDS_API, AREAS_API } from "../config/apiConfig";
import { DASHBOARD_MASTER_API } from "../config/apiConfig";
// GET Active Alerts 
export const fetchActiveAlerts = () => {
    return axiosInstance.get(ALERTS_ACTIVE_API);
};

// GET Resolved Alert History 
export const fetchAlertHistory = () => {
    return axiosInstance.get(ALERTS_HISTORY_API);
};

export const fetchAreas = () => {
    return axiosInstance.get(AREAS_API);
};


export const fetchThresholds = () => {
    return axiosInstance.get(THRESHOLDS_API);
};

export const updateThresholdAPI = (data) => {
    return axiosInstance.post(THRESHOLDS_API, data);
};

export const resolveAlertAPI = (id) => {
    return axiosInstance.put(`${ALERTS_ACTIVE_API.replace('/active', '')}/${id}/resolve`);
};

// Master Core Dashboard Telemetry Fetcher Service
export const fetchMasterDashboardData = () => {
    return axiosInstance.get(DASHBOARD_MASTER_API);
};
