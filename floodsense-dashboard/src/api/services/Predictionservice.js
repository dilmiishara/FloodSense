import axiosInstance from "../axios.js";
import { PREDICTIONS_LATEST_API } from "../config/apiConfig.js";

export const fetchLatestPredictions = async () => {
    const response = await axiosInstance.get(PREDICTIONS_LATEST_API);
    return response;
};