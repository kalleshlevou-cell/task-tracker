const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const { taskValidationRules, validate } = require('../middleware/validate');

// GET /api/tasks/stats — must be before /:id so "stats" isn't treated as an ID
router.get('/stats', getTaskStats);

// GET  /api/tasks       — list all tasks (with filter/sort/search/pagination)
// POST /api/tasks       — create a task
router.route('/').get(getTasks).post(taskValidationRules, validate, createTask);

// GET    /api/tasks/:id — get one task
// PUT    /api/tasks/:id — update a task
// DELETE /api/tasks/:id — delete a task
router
  .route('/:id')
  .get(getTaskById)
  .put(taskValidationRules, validate, updateTask)
  .delete(deleteTask);

module.exports = router;
