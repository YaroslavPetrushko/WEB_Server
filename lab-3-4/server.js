const express = require("express");
const app = express();
app.use(express.json()); // JSON parser
// Middleware логування (повинен бути ДО маршрутів)
app.use((req, res, next) => {
console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
next();
});

const notes = []; // in-memory "база"
// Головний маршрут
app.get("/", (req, res) => {
res.send("Hello, World!");
});
// Отримання списку заміток
app.get("/notes", (req, res) => {
res.json(notes);
});
// (Опційно, але корисно) Отримання однієї замітки за id
app.get("/notes/:id", (req, res) => {
const id = parseInt(req.params.id, 10);
const note = notes.find(n => n.id === id);
if (!note) {
return res.status(404).json({ error: "Note not found" });
}
res.json(note);
});
// Додавання нової замітки
app.post("/notes", (req, res) => {
const { id, text } = req.body;
// Валідація
if (typeof id !== "number" || typeof text !== "string") {
return res.status(400).json({ error: "Invalid note format" });
}
// Перевірка унікальності id
if (notes.some(n => n.id === id)) {
return res.status(409).json({ error: "Note with this id already exists" });
}

const note = { id, text };
notes.push(note);
res.status(201).json(note);
});
// Оновлення замітки за ідентифікатором (PUT – повне оновлення)
app.put("/notes/:id", (req, res) => {
const id = parseInt(req.params.id, 10);
const { text } = req.body;
const idx = notes.findIndex(n => n.id === id);
if (idx === -1) {
return res.status(404).json({ error: "Note not found" });
}
// Валідація
if (typeof text !== "string") {
return res.status(400).json({ error: "Invalid note format" });
}
// id беремо з URL, щоб не “губився” та не змінювався
const updatedNote = { id, text };
notes[idx] = updatedNote;
res.json(updatedNote);
});
// Видалення замітки за ідентифікатором
app.delete("/notes/:id", (req, res) => {
const id = parseInt(req.params.id, 10);
const idx = notes.findIndex(n => n.id === id);
if (idx === -1) {
return res.status(404).json({ error: "Note not found" });
}
notes.splice(idx, 1);
res.status(204).send(); // No Content
});
app.listen(3000, () => {
console.log("Server is running on port 3000");
});

