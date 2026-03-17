// src/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 🔥 INTERCEPTOR: Har request se pehle ye code chalega 🔥
API.interceptors.request.use((req) => {
  const storedUser = sessionStorage.getItem('beatflow_user'); // Naya wala storage!
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;