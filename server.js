const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// static folder for uploaded images
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/' + uploadDir, express.static(path.join(__dirname, uploadDir)));

// connect to mongo
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/todo_notes_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// routes
const tasksRouter = require('./routes/tasks');
const notesRouter = require('./routes/notes');

app.use('/api/tasks', tasksRouter);
app.use('/api/notes', notesRouter);

app.get('/', (req, res) => res.json({ ok: true, msg: 'To-Do & Notes API' }));

app.listen(PORT, () => console.log('Server running on port', PORT));
