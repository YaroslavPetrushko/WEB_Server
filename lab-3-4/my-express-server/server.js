const express = require('express');
const app = express();
app.use(express.json()); // JSON parser

// Middleware логування
app.use((req, res, next) => {
console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
next();
});

// "База даних" в пам'яті
const items = [ 
    {id:1, name: "Товар 1", price: 100},
    {id:2, name: "Товар 2", price: 200}
]; 

// Головний маршрут
app.get("/", (req, res) => {
res.send("Hello, World!");
});

// Отримання списку товарів
app.get('/items', (req, res) => {
    res.json(items);
});

// Отримання товару за id
app.get('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = items.find(i => i.id === id);
    if (!item) {
        return res.status(404).json({ error: "Товар не знайдено" });
    }
    res.json(item);
});

// Додавання нового товару до масиву та виведення до консолі
app.post('/items', (req, res) => {
    const { id, name, price } = req.body;
    
    // Валідація
    if (typeof id !== 'number' || typeof name !== 'string' || typeof price !== 'number') {
        return res.status(400).json({ error: "Невірний формат товару" });
    }
    
    // Перевірка унікальності id
    if (items.some(i => i.id === id)) {
        return res.status(409).json({ error: "Товар з таким id вже існує" });
    }
    
    // Додавання товару до масиву
    const newItem = { id, name, price };
    items.push(newItem);
    console.log(`[INFO] Товар додано: ${JSON.stringify(newItem)}`);
    res.status(201).json(newItem);
});

// Оновлення товару за id
app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, price } = req.body;
    const idx = items.findIndex(i => i.id === id);
    
    if (idx === -1) {
        return res.status(404).json({ error: "Товар не знайдено" });
    }
    
    // Валідація
    if (typeof name !== 'string' || typeof price !== 'number') {
        return res.status(400).json({ error: "Невірний формат товару" });
    }
    
    // Оновлення товару
    items[idx] = { ...items[idx], name, price };
    console.log(`[INFO] Товар оновлено: ${JSON.stringify(items[idx])}`);
    res.json(items[idx]);
});

// Видалення товару за id
app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = items.findIndex(i => i.id === id);

    if (idx === -1) {
        return res.status(404).json({ error: "Товар не знайдено" });
    }

    const deletedItem = items.splice(idx, 1)[0];
    console.log(`[INFO] Товар видалено: ${JSON.stringify(deletedItem)}`);
    res.status(204).send(); // No Content 
});

app.listen(3000, () => {
console.log("Server is running on port 3000");
});
