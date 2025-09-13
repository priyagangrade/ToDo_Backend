const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// multer setup (store file in uploads folder, keep original name with timestamp)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, name + '_' + Date.now() + ext);
  }
});

function fileFilter (req, file, cb) {
  // allow only jpg/png
  const allowed = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) return cb(new Error('Only JPG/PNG allowed'));
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'Pending',
    };
    if (req.file) payload.image = req.file.filename;
    const task = new Task(payload);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;

    if (req.file) {
      // delete old image if exists
      if (task.image) {
        const oldPath = path.join(uploadDir, task.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      task.image = req.file.filename;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    if (task.image) { // delete associated image
      const p = path.join(uploadDir, task.image);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    await Task.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
