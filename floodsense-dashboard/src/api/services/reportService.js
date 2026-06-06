import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000/api'; 


export const generateReportAPI = (data) => {
    return axios.post(`${API_URL}/reports`, data);
};


export const fetchReportArchive = () => {
    return axios.get(`${API_URL}/reports`);
};

export const deleteReportAPI = (id) => {
    return axios.delete(`${API_URL}/reports/${id}`);
};