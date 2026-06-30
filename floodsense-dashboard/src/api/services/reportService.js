import axios from 'axios';


const API_URL = 'https://floodsense-api-389447895642.asia-southeast1.run.app/api';


export const generateReportAPI = (data) => {
    return axios.post(`${API_URL}/reports`, data);
};


export const fetchReportArchive = () => {
    return axios.get(`${API_URL}/reports`);
};

export const deleteReportAPI = (id) => {
    return axios.delete(`${API_URL}/reports/${id}`);
};