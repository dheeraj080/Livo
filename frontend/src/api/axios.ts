import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { setupMockApi } from './mockApi';

const api = axios.create({
  baseURL: 'http://localhost:2000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup Mock Mode if enabled or via fallback (optional)
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

if (isMockMode) {
  setupMockApi(api);
  console.log('✨ [Livo] Testing Mode: Activated (Running with Local Mocks)');
} else {
  console.log('📡 [Livo] Connection Mode: Activated (Connecting to Java Backend)');
}

// Request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error: any) => {
  return Promise.reject(error);
});

// Response interceptor for handling errors (e.g., token expiration)
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Token might be expired - logout the user
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
