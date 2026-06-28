import axios from 'axios';

// In dev, Vite proxies /api → localhost:5000 (see vite.config.js)
// In production, set VITE_API_URL to your deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      // Network error — server is likely not running
      return Promise.reject(
        new Error('Cannot reach the server. Make sure the backend is running on port 5000.')
      );
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─── Task API ─────────────────────────────────────────────────────────────────

export const taskApi = {
  // GET /tasks  — supports ?status, ?priority, ?search, ?sortBy, ?order, ?page, ?limit
  getAll: (params = {}) => api.get('/tasks', { params }),

  // GET /tasks/stats
  getStats: () => api.get('/tasks/stats'),

  // GET /tasks/:id
  getById: (id) => api.get(`/tasks/${id}`),

  // POST /tasks
  create: (data) => api.post('/tasks', data),

  // PUT /tasks/:id
  update: (id, data) => api.put(`/tasks/${id}`, data),

  // DELETE /tasks/:id
  remove: (id) => api.delete(`/tasks/${id}`),
};

export default api;
