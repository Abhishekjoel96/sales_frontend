// src/config/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://sales-project-1.onrender.com/api', // Your Render backend URL
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY,  //  Get API key from environment
    },
});


export default api;