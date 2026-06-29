const Task = require('../models/Task');

const useMemoryStore = () => {
  const uri = process.env.MONGODB_URI;
  return !uri || uri.includes('<username>') || uri.includes('<password>');
};

const toTaskPayload = (task, id = task?._id) => ({
  _id: id || task?._id || `${Date.now()}`,
  title: task?.title || '',
  description: task?.description || '',
  status: task?.status || 'todo',
  priority: task?.priority || 'medium',
  dueDate: task?.dueDate || null,
  tags: Array.isArray(task?.tags) ? task.tags : [],
  createdAt: task?.createdAt || new Date(),
  updatedAt: task?.updatedAt || new Date(),
});

const memoryTasks = [];

const applyMemoryFilters = (tasks, { status, priority, search }) => {
  return tasks.filter((task) => {
    const matchesStatus = !status || status === 'all' || task.status === status;
    const matchesPriority = !priority || priority === 'all' || task.priority === priority;
    const matchesSearch = !search || [task.title, task.description, ...(task.tags || [])].some((value) =>
      String(value).toLowerCase().includes(String(search).toLowerCase())
    );

    return matchesStatus && matchesPriority && matchesSearch;
  });
};

// @desc    Get all tasks with filtering, sorting & search
// @route   GET /api/tasks
// @access  Public
const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    if (useMemoryStore()) {
      const validSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'dueDate'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const sortOrder = order === 'asc' ? 1 : -1;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const filteredTasks = applyMemoryFilters(memoryTasks, { status, priority, search }).sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (aValue < bValue) return sortOrder === 1 ? -1 : 1;
        return sortOrder === 1 ? 1 : -1;
      });

      const pagedTasks = filteredTasks.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        data: pagedTasks,
        pagination: {
          total: filteredTasks.length,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(filteredTasks.length / limitNum),
        },
      });
    }

    // Build filter object
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Build sort object
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'dueDate'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res, next) => {
  try {
    if (useMemoryStore()) {
      const task = memoryTasks.find((item) => item._id === req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      return res.json({ success: true, data: task });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    if (useMemoryStore()) {
      const task = toTaskPayload({ title, description, status, priority, dueDate, tags }, `${Date.now()}`);
      memoryTasks.push(task);
      return res.status(201).json({ success: true, message: 'Task created successfully', data: task });
    }

    const task = await Task.create({ title, description, status, priority, dueDate, tags });
    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    if (useMemoryStore()) {
      const index = memoryTasks.findIndex((task) => task._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const updatedTask = toTaskPayload(
        {
          ...memoryTasks[index],
          title,
          description,
          status,
          priority,
          dueDate,
          tags,
          updatedAt: new Date(),
        },
        req.params.id
      );
      memoryTasks[index] = updatedTask;
      return res.json({ success: true, message: 'Task updated successfully', data: updatedTask });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task updated successfully', data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = async (req, res, next) => {
  try {
    if (useMemoryStore()) {
      const index = memoryTasks.findIndex((task) => task._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const deletedTask = memoryTasks.splice(index, 1)[0];
      return res.json({ success: true, message: 'Task deleted successfully', data: deletedTask });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully', data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Public
const getTaskStats = async (req, res, next) => {
  try {
    if (useMemoryStore()) {
      const formattedStats = {
        total: memoryTasks.length,
        byStatus: {},
        byPriority: {},
      };

      memoryTasks.forEach((task) => {
        formattedStats.byStatus[task.status] = (formattedStats.byStatus[task.status] || 0) + 1;
        formattedStats.byPriority[task.priority] = (formattedStats.byPriority[task.priority] || 0) + 1;
      });

      return res.json({ success: true, data: formattedStats });
    }

    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Task.countDocuments();

    const formattedStats = { total, byStatus: {}, byPriority: {} };
    stats.forEach((s) => (formattedStats.byStatus[s._id] = s.count));
    priorityStats.forEach((s) => (formattedStats.byPriority[s._id] = s.count));

    res.json({ success: true, data: formattedStats });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getTaskStats };
