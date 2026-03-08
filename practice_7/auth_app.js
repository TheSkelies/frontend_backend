const express = require('express');
const { nanoid } = require("nanoid");
const bcrypt = require('bcrypt');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');


const app = express();
const port = 3000;
const JWT_SECRET = "access_secret";
const ACCESS_EXPIRES_IN = "15m";



const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API AUTH',
            version: '1.0.0',
            description: 'Простое API для изучения авторизации',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./auth_app.js'],
};
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           example: Кружка
 *         category:
 *           type: string
 *           example: Посуда
 *         description:
 *           type: string
 *           example: Кружка синяя керамическая объёмом 300 мл
 *         price:
 *           type: integer
 *           example: 300
 *       example:
 *         id: "KYdvf_3"
 *         title: "Чашка"
 *         category: "Посуда"
 *         description: "Синяя чашка 250 мл"
 *         price: 500
 */


// { id, email, first_name, last_name, age, hashedPassword }
let users = [];
// { id, title, category, description, price }
let products = [];

function findUserOr404(email, res) {
    const user = users.find(u => u.email == email);
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}

function findProductOr404(prod_id, res) {
    const product = products.find(p => p.id == prod_id);
    if (!product) {
        res.status(404).json({ error: "product not found" });
        return null;
    }
    return product;
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header",
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        req.user = payload; // { sub, username, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }

}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}
async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}


const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}]
${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method ===
            'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - age
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: Pochta@mail.ru
 *               age:
 *                 type: integer
 *                 example: 20
 *               first_name:
 *                 type: string
 *                 example: Artem
 *               last_name:
 *                 type: string
 *                 example: Ilyukhin
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: JHls8
 *                 email:
 *                   type: string
 *                   example: Pochta@mail.ru
 *                 age:
 *                   type: integer
 *                   example: 20
 *                 first_name:
 *                   type: string
 *                   example: Artem
 *                 last_name:
 *                   type: string
 *                   example: Ilyukhin
 *                 hashedPassword:
 *                   type: string
 *                   example: $2b$10$iLKX1Al9DyFOmpFlzpFD2eM4VkM4j0ZI6d4B62Om35QzIcYVlegCy
 *       400:
 *         description: Некорректные данные
 */
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, age, password } = req.body;
    if (!email || !password || age === undefined || !first_name || !last_name) {
        return res.status(400).json({ error: "all parameters  are required" });
    }
    const newUser = {
        id: nanoid(5),
        email: email,
        age: Number(age),
        first_name: first_name,
        last_name: last_name,
        hashedPassword: await hashPassword(password)
    };
    users.push(newUser);
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        age: newUser.age,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
    });
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет логин и пароль пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: Pochta@mail.ru
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }
    const user = findUserOr404(email, res);
    if (!user) return;
    const isAuthenticated = await verifyPassword(password, user.hashedPassword);
    if (!isAuthenticated)
    {
        res.status(401).json({ error: "not authenticated" })
    }
    // Создание access-токена
    const accessToken = jwt.sign(
        {
            sub: user.id,
            username: user.username,
        },
        JWT_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
    res.json({
        accessToken,
    });

});


app.get("/api/auth/me", authMiddleware, (req, res) => {
    // sub мы положили в токен при login
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({
            error: "User not found",
        });
    }
    // никогда не возвращаем passwordHash
    res.json({
        id: user.id,
        email: user.email,
    });
});


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создание товара
 *     description: Создает новый товар с уникальным id
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Кружка
 *               category:
 *                 type: string
 *                 example: Посуда
 *               description:
 *                 type: string
 *                 example: Кружка синяя керамическая объёмом 300 мл
 *               price:
 *                 type: integer
 *                 example: 300
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: JHVJsd
 *                 title:
 *                   type: string
 *                   example: Кружка
 *                 category:
 *                   type: string
 *                   example: Посуда
 *                 description:
 *                   type: string
 *                   example: Кружка синяя керамическая объёмом 300 мл
 *                 price:
 *                   type: integer
 *                   example: 300
 *       400:
 *         description: Некорректные данные
 */
app.post("/api/products", async (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ "error": "all parameters  are required" });
    }
    const newProduct = {
        id: nanoid(6),
        title: title,
        category: category,
        description: description,
        price: price
    }
    products.push(newProduct);
    res.status(201).json(newProduct);
})

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     description: Возвращает массив всех доступных продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", async (req, res) => {
    res.send(JSON.stringify(products));
})


/**
 * @swagger
 * /api/products/:id:
 *   get:
 *     summary: Получить список товаров
 *     description: Возвращает массив всех доступных продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products/:id", authMiddleware, async (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    res.send(JSON.stringify(product));
})


app.put("/api/products/:id", authMiddleware, async (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;

    if (req.body?.title === undefined &&
        req.body?.category === undefined &&
        req.body?.description === undefined &&
        req.body?.price === undefined) {
        return res.status(400).json({ error: "Nothing to update" });
    }

    const { title, category, description, price } = req.body;

    if (title !== undefined) product.title = title.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);

    res.json(product);

})


// DELETE /api/products/:id - удаление товара
app.delete("/api/products/:id", authMiddleware, (req, res) => {
    const id = req.params.id;
    const exists = products.find(p => p.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });

    products = products.filter((p) => p.id !== id);
    res.status(204).send();
});



app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});
