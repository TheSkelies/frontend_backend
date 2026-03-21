const express = require('express');
const { nanoid } = require("nanoid");
const bcrypt = require('bcrypt');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const app = express();
const port = 3000;
const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";


// { id, email, first_name, last_name, age, hashedPassword, role }
let users = [
];
// { id, title, category, description, price }
let products = [
    {id: "JHBvfd",
        title: "Тестовый товар",
        category: "Категория тестового товара",
        description: "Длииииииииииииииииииииииииииииииииииииииииииииииииииинное описание тестового товара",
        price: 123
    }
];
// Хранилище refresh-токенов
const refreshTokens = new Set();



// CORS настройки
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// СВАГЕР
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



// ФУНКЦИИ
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
        const payload = jwt.verify(token, ACCESS_SECRET);

        req.user = payload; // { sub, username, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}

// Role middleware
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }
        next();
    };
}


function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}



async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}
async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}



// АВТОРИЗАЦИЯ
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, age, password, role } = req.body;
    if (!email || !password || age === undefined || !first_name || !last_name || !role) {
        return res.status(400).json({ error: "all parameters  are required" });
    }
    const newUser = {
        id: nanoid(5),
        email: email,
        age: Number(age),
        first_name: first_name,
        last_name: last_name,
        role: role || "user",
        hashedPassword: await hashPassword(password)
    };
    users.push(newUser);
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        age: newUser.age,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
    });
});

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
    const accessToken = generateAccessToken(user);


    // Создание refresh-токена
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken)

    res.json({
        accessToken,
        refreshToken,
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
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        role: user.role,
    });
});





app.post("/api/auth/refresh", (req, res) => {
    const refreshToken = req.headers.authorization;

    if (!refreshToken) {
        return res.status(400).json({
            error: "Refresh token is required",
        })
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "Invalid refresh token",
        })
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find((u) => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({
                error: "User not found"
            });
        }

        // Ротация refresh-токена
        // старый удаляем, создаём новый
        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
})


// Пользователи
app.get("/api/users", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    res.send(JSON.stringify(users));
})

// DELETE /api/users/:id - удаление пользователя
app.delete("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const id = req.params.id;
    const exists = users.find(p => p.id === id);
    if (!exists) return res.status(404).json({ error: "User not found" });

    users = users.filter((p) => p.id !== id);
    res.status(204).send();
});

app.put("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const email_of_user = req.params.email;
    const user = findUserOr404(email_of_user, res);
    if (!user) return;

    if (req.body?.email === undefined &&
        req.body?.first_name === undefined &&
        req.body?.last_name === undefined &&
        req.body?.age === undefined &&
        req.body?.role === undefined) {
        return res.status(400).json({ error: "Nothing to update" });
    }

    const { email, first_name, last_name, age, role } = req.body;

    if (email !== undefined) user.title = email.trim();
    if (first_name !== undefined) user.category = first_name.trim();
    if (last_name !== undefined) user.description = last_name.trim();
    if (age !== undefined) user.age = Number(age);
    if (role !== undefined) user.role = role.trim();

    res.json(user);

})


// ТОВАРЫ
app.post("/api/products", authMiddleware, roleMiddleware(["seller", "admin"]), async (req, res) => {
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

app.get("/api/products", authMiddleware, async (req, res) => {
    res.send(JSON.stringify(products));
})



app.get("/api/products/:id", authMiddleware, roleMiddleware(["seller", "admin"]), async (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    res.send(JSON.stringify(product));
})


app.put("/api/products/:id", authMiddleware, roleMiddleware(["seller", "admin"]), async (req, res) => {
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
app.delete("/api/products/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
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
