// src/config/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'https://sales-project-1.onrender.com/api', // Use VITE_ prefix
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY,  // Use VITE_ prefix and your frontend API key.
    },
});

export default api;
