// src/api/settings.js
import axios from 'axios';

const BASE = 'https://floodsense-api-389447895642.asia-southeast1.run.app/api';

export const fetchSettings = (section) =>
  axios.get(`${BASE}/settings/${section}`).then(r => r.data);

export const saveSettings = (section, data) =>
  axios.post(`${BASE}/settings/${section}`, data).then(r => r.data);