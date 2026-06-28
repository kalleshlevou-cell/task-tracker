import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS = {
  status: 'all',
  priority: 'all',
  search: '',
  sortBy: 'createdAt',
  order: 'desc',
};

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // ─── Fetch tasks whenever filters change ─────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search.trim()) params.search = filters.search.trim();
      params.sortBy = filters.sortBy;
      params.order = filters.order;

      const res = await taskApi.getAll(params);
      const payload = res?.data ?? res;
      const taskList = Array.isArray(payload) ? payload : payload?.data ?? [];
      const paginationData = payload?.pagination ?? { total: 0, page: 1, pages: 1 };

      setTasks(taskList);
      setPagination(paginationData);
    } catch (err) {
      setTasks([]);
      setPagination({ total: 0, page: 1, pages: 1 });
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await taskApi.getStats();
      const payload = res?.data ?? res;
      setStats(payload ?? null);
    } catch (_) {
      setStats(null);
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, tasks]); // refresh stats when tasks change

  // ─── CRUD operations ─────────────────────────────────────────────────────
  const createTask = async (data) => {
    setSubmitting(true);
    try {
      const res = await taskApi.create(data);
      setTasks((prev) => [res.data, ...prev]);
      toast.success('Task created!');
      fetchStats();
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const updateTask = async (id, data) => {
    setSubmitting(true);
    try {
      const res = await taskApi.update(id, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      toast.success('Task updated!');
      fetchStats();
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskApi.remove(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted!');
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return {
    tasks,
    stats,
    loading,
    submitting,
    filters,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    resetFilters,
    refetch: fetchTasks,
  };
};
