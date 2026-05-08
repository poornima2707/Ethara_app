const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks - Get all tasks for user (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { project, status, priority, assignedTo } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Non-admin users only see tasks assigned to them
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/dashboard - Dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    let projectFilter = {};
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }]
      }).select('_id');
      projectFilter = { project: { $in: userProjects.map(p => p._id) } };
    }

    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { assignedTo: req.user.id };
    const projectQuery = isAdmin ? {} : { members: req.user.id };

    const [tasks, projectCount] = await Promise.all([
        Task.find(query).populate('project assignedTo').sort({ updatedAt: -1 }),
        Project.countDocuments(projectQuery)
    ]);

    const now = new Date();
    const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status !== 'completed').length,
        overdueTasks: tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length,
        projectCount
    };

    res.json({ stats, recentTasks: tasks.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks - Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access: admin or project member/owner
    if (req.user.role !== 'admin' &&
        projectDoc.owner.toString() !== req.user._id.toString() &&
        !projectDoc.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      project,
      assignedTo,
      createdBy: req.user._id
    });

    // Notify assignee
    if (assignedTo && assignedTo.toString() !== req.user.id) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user.id,
        type: 'task_assigned',
        message: `New task assigned: ${title}`,
        relatedId: task._id
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, assignedTo },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Notify project owner on status change
    if (status) {
      const projectDoc = await Project.findById(task.project?._id);
      if (projectDoc) {
        await Notification.create({
          recipient: projectDoc.owner,
          sender: req.user.id,
          type: 'status_updated',
          message: `${req.user.name} updated "${task.title}" to ${status}`,
          relatedId: task._id
        });
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
