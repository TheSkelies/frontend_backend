const express = require("express");
const app = express();
const port = 3000;

// массив товаров
let products = [
    {id: 1, name: 'Микроволновка', cost: 5000},
    {id: 2, name: 'Телефон', cost: 25000},
    {id: 3, name: 'Провод', cost: 350},
];

app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    res.send("Главная страница");
});

// Добавление нового товара
app.post('/products', (req, res) => {
    const { name, cost } = req.body;

    const newProduct = {
        id: Date.now(),
        name,
        cost,
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Вывод всех товаров
app.get('/products', (req, res) => {
    res.send(JSON.stringify(products));
});

// Вывод товара по его id
app.get('/products/:id', (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    res.send(JSON.stringify(product));
});

// Изменение заданных параметров у товара по его id
app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    const { name, cost } = req.body;

    if (name !== undefined) products.name = name;
    if (cost !== undefined) products.cost = cost;

    res.json(product);
});

// Удаление товара
app.delete('/products/:id', (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.send("Ok");
});


app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});


