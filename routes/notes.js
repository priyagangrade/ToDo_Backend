const express = require('express');
const Note = require('../models/Note');
const router = express.Router();

// GET /api/notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes
router.post('/', async (req, res) => {
  try {
    const note = new Note({ text: req.body.text });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    await Note.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
