import axios from 'axios';

// In dev, Vite proxies /api → localhost:5000 (see vite.config.js)
// In production, Vercel serves only the frontend, so the client falls back to local storage.
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const STORAGE_KEY = 'task-tracker-local-tasks';
const isBrowser = typeof window !== 'undefined';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const readTasks = () => {
  if (!isBrowser) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeTasks = (tasks) => {
  if (!isBrowser) return tasks;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore storage failures
  }

  return tasks;
};

const normalizeTask = (task, fallbackId) => ({
  _id: task?._id || fallbackId || `local-${Date.now()}`,
  title: task?.title || '',
  description: task?.description || '',
  status: task?.status || 'todo',
  priority: task?.priority || 'medium',
  dueDate: task?.dueDate || null,
  tags: Array.isArray(task?.tags) ? task.tags : [],
  createdAt: task?.createdAt || new Date().toISOString(),
  updatedAt: task?.updatedAt || new Date().toISOString(),
});

const getFilteredTasks = (tasks, params = {}) => {
  const {
    status,
    priority,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20,
  } = params;

  const filtered = tasks.filter((task) => {
    const matchesStatus = !status || status === 'all' || task.status === status;
    const matchesPriority = !priority || priority === 'all' || task.priority === priority;
    const matchesSearch = !search || [task.title, task.description, ...(task.tags || [])].some((value) =>
      String(value).toLowerCase().includes(String(search).toLowerCase())
    );

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const validSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'dueDate'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  filtered.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const aComparable = aValue instanceof Date ? aValue.getTime() : String(aValue).toLowerCase();
    const bComparable = bValue instanceof Date ? bValue.getTime() : String(bValue).toLowerCase();

    if (aComparable < bComparable) return sortOrder === 1 ? -1 : 1;
    if (aComparable > bComparable) return sortOrder === 1 ? 1 : -1;
    return 0;
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const start = (pageNum - 1) * limitNum;
  const paged = filtered.slice(start, start + limitNum);

  return {
    items: paged.map(normalizeTask),
    total: filtered.length,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(filtered.length / limitNum) || 1,
  };
};

const getLocalStats = (tasks) => {
  const byStatus = {};
  const byPriority = {};

  tasks.forEach((task) => {
    byStatus[task.status] = (byStatus[task.status] || 0) + 1;
    byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
  });

  return {
    total: tasks.length,
    byStatus,
    byPriority,
  };
};

const fallbackResponse = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    return fallback(error);
  }
};

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Cannot reach the server. The app will use local browser storage instead.'));
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
  getAll: (params = {}) =>
    fallbackResponse(
      () => api.get('/tasks', { params }),
      () => {
        const tasks = readTasks();
        const result = getFilteredTasks(tasks, params);
        return {
          success: true,
          data: result.items,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: result.pages,
          },
        };
      }
    ),

  // GET /tasks/stats
  getStats: () =>
    fallbackResponse(
      () => api.get('/tasks/stats'),
      () => ({ success: true, data: getLocalStats(readTasks()) })
    ),

  // GET /tasks/:id
  getById: (id) =>
    fallbackResponse(
      () => api.get(`/tasks/${id}`),
      () => {
        const task = readTasks().find((item) => item._id === id);
        return task ? { success: true, data: normalizeTask(task) } : { success: false, message: 'Task not found' };
      }
    ),

  // POST /tasks
  create: (data) =>
    fallbackResponse(
      () => api.post('/tasks', data),
      () => {
        const task = normalizeTask({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, `local-${Date.now()}`);
        const nextTasks = writeTasks([task, ...readTasks()]);
        return { success: true, message: 'Task created successfully', data: task, storedTasks: nextTasks };
      }
    ),

  // PUT /tasks/:id
  update: (id, data) =>
    fallbackResponse(
      () => api.put(`/tasks/${id}`, data),
      () => {
        const tasks = readTasks();
        const index = tasks.findIndex((task) => task._id === id);
        if (index === -1) {
          return { success: false, message: 'Task not found' };
        }

        const updatedTask = normalizeTask(
          {
            ...tasks[index],
            ...data,
            updatedAt: new Date().toISOString(),
          },
          id
        );
        tasks[index] = updatedTask;
        writeTasks(tasks);
        return { success: true, message: 'Task updated successfully', data: updatedTask };
      }
    ),

  // DELETE /tasks/:id
  remove: (id) =>
    fallbackResponse(
      () => api.delete(`/tasks/${id}`),
      () => {
        const tasks = readTasks();
        const nextTasks = tasks.filter((task) => task._id !== id);
        writeTasks(nextTasks);
        return { success: true, message: 'Task deleted successfully' };
      }
    ),
};

export default api;
