// src/config/api.ts
import axios from 'axios';
import config from '../../../backend/src/config/config';

const api = axios.create({
    baseURL: 'https://sales-project-1.onrender.com/api', // Your Render backend URL
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,  // Use the API key from the backend config
    },
});

export default api;
