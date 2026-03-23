import axios from 'axios';

// Use the dynamic APP_URL provided by the platform
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
});
