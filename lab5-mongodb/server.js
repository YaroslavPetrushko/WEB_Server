require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Note = require('./models/Note');

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());

// Базове логування
app.use ((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Підключення до MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Connection error:', err));

// GET /notes - отримати всі нотатки
app.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /notes/:id - отримати нотатку за ID
app.get('/notes/:id', async (req, res) => {
    try {

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid ObjectId" });
        }

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        
        res.json(note);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /notes - створити нову нотатку
app.post('/notes', async (req, res) => {
    try {
        const { title, text } = req.body;

        if (!title || !text) {
            return res.status(400).json({ error: "title and text are required" });
        }

        const note = new Note({ title, text });
        await note.save();

        res.status(201).json(note);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /notes/:id - оновити нотатку за ID
app.put('/notes/:id', async (req, res) => {
    try {
        
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid ObjectId" });
        }
        
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            req.body, 
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
    
        res.json(updatedNote);
    } 
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /notes/:id - видалити нотатку за ID
app.delete('/notes/:id', async (req, res) => {
    try {

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid ObjectId" });
        }
        const deletedNote = await Note.findByIdAndDelete(req.params.id);

        if (!deletedNote){
            return res.status(404).json({ message: 'Note not found' });
        }
        
        res.status(204).json({ message: 'Note deleted' });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));