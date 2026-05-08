const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects - Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('owner', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }]
      })
        .populate('owner', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    }

    // Add task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: new mongoose.Types.ObjectId(project._id) } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const counts = { todo: 0, 'in-progress': 0, completed: 0, total: 0 };
        taskCounts.forEach(tc => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });
        return { ...project.toObject(), taskCounts: counts };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    if (req.user.role !== 'admin' &&
        project.owner._id.toString() !== req.user._id.toString() &&
        !project.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/projects - Create project (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || []
    });

    // Notify all members
    if (members && members.length > 0) {
      const notifications = members.map(memberId => ({
        recipient: memberId,
        sender: req.user._id,
        type: 'project_created',
        message: `You have been added to a new project: ${name}`,
        relatedId: project._id
      }));
      await Notification.insertMany(notifications);
    }

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/projects/:id - Update project (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, members, status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members, status },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/projects/:id - Delete project (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
