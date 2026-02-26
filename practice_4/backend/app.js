// node app.js

const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;

// Начальные данные товаров
let products = [
    {
        id: nanoid(6),
        name: 'Ноутбук ASUS ROG',
        category: 'Ноутбуки',
        description: 'Игровой ноутбук с RTX 3060, 16GB RAM, 512GB SSD',
        price: 89990,
        stock: 5,
        imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStKtmAq7H7Jk4Rneb7pEj5k7GSvG07h2uIhA&s"
    },
    {
        id: nanoid(6),
        name: 'Смартфон Xiaomi 13T',
        category: 'Смартфоны',
        description: 'AMOLED 144Hz, 8GB RAM, 256GB ROM, 50MP камера',
        price: 39990,
        stock: 12,
        imgURL: "https://img.freepik.com/premium-psd/smartphone-mockup_8121-67.jpg?semt=ais_hybrid&w=740&q=80"
    },
    {
        id: nanoid(6),
        name: 'Наушники Sony',
        category: 'Аудио',
        description: 'Беспроводные наушники с шумоподавлением',
        price: 24990,
        stock: 8,
        imgURL: "https://images.philips.com/is/image/philipsconsumer/491e2dd5e0d1466f8ee5b0cd010451ae?$pnglarge$&wid=960"
    },
    {
        id: nanoid(6),
        name: 'Монитор Samsung Odyssey',
        category: 'Мониторы',
        description: '27" 240Hz, 1ms, OLED, изогнутый',
        price: 45990,
        stock: 3,
        imgURL: "https://cdn.thewirecutter.com/wp-content/media/2024/07/27-inch-monitor-2048px-233796-3x2-1.jpg?auto=webp&quality=75&crop=16:9,smart&width=1024"
    }
];

// Middleware
app.use(express.json());

// CORS настройки
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware для логирования запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Функция-помощник для получения товара из списка
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// GET /api/products - получение списка товаров
app.get("/api/products", (req, res) => {
    res.json(products);
});

// GET /api/products/:id - получение товара по ID
app.get("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

// POST /api/products - создание нового товара
app.post("/api/products", (req, res) => {
    const { name, category, description, price, stock, imgURL } = req.body;

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        imgURL: imgURL.trim(),
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PATCH /api/products/:id - изменение товара
app.patch("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;

    if (req.body?.name === undefined &&
        req.body?.category === undefined &&
        req.body?.description === undefined &&
        req.body?.price === undefined &&
        req.body?.stock === undefined &&
        req.body?.imgURL === undefined) {
        return res.status(400).json({ error: "Nothing to update" });
    }

    const { name, category, description, price, stock, imgURL } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (imgURL !== undefined) product.imgURL = imgURL;

    res.json(product);
});

// DELETE /api/products/:id - удаление товара
app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const exists = products.some((p) => p.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });

    products = products.filter((p) => p.id !== id);
    res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});