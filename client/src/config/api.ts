// src/config/api.ts
import axios from 'axios';
import config from '../../../backend/src/config/config';

const api = axios.create({
   baseURL: import.meta.env.VITE_BACKEND_URL || 'https://sales-project-1.onrender.com/api', // Correct way
   headers: {
       'Content-Type': 'application/json',
       'X-API-Key': import.meta.env.VITE_API_KEY,  // Correct way
   },
});

export default api;
