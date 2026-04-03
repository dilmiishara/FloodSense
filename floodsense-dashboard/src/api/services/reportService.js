import axios from 'axios';

// API එකේ Base URL එක (ඔබේ .env එකේ ඇති එක පාවිච්චි කරන්න)
const API_URL = 'http://127.0.0.1:8000/api'; 

// Report එකක් Generate කිරීමට
export const generateReportAPI = (data) => {
    return axios.post(`${API_URL}/reports/generate`, data);
};

// කලින් සෑදූ Reports ලැයිස්තුව (Archive) ලබා ගැනීමට
export const fetchReportArchive = () => {
    return axios.get(`${API_URL}/reports`);
};

export const deleteReportAPI = (id) => {
    return axios.delete(`${API_URL}/reports/${id}`);
};