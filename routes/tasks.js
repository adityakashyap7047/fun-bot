const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');
const { ensureAuth } = require('../middleware/auth');

const TASK_FIELDS = ['title', 'description', 'priority', 'done', 'dueDate'];

// GET all tasks (auth required - private data)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// POST create task (auth required)
router.post('/', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, TASK_FIELDS);
    const task = new Task(data);
    await task.save();
    discord.taskCreated(task);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

// PUT update task (auth required)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, TASK_FIELDS);
    const task = await Task.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (data.done === true) discord.taskCompleted(task);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

// DELETE task (auth required)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
