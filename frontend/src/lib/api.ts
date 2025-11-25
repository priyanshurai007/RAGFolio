import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/api/auth/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  me: () => api.get('/api/auth/me'),
};

// Resume API
export const resumeAPI = {
  upload: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    return api.post('/api/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  
  getAll: () => api.get('/api/resumes'),
  
  getById: (id: string) => api.get(`/api/resumes/${id}`),
  
  update: (id: string, parsedData: any) =>
    api.put(`/api/resumes/${id}`, { parsedData }),
  
  delete: (id: string) => api.delete(`/api/resumes/${id}`),
  
  query: (id: string, question: string) =>
    api.post(`/api/resumes/${id}/query`, { question }),
};
