import { Pool } from 'pg';
import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();



const sequelize = new Sequelize('fb_database', 'postgres', '723812y391y23', {
    host: 'localhost',
    dialect: 'postgres',
});

app.use(express.json());

sequelize.authenticate()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error: ', err));


const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'email'
    },
    lastName: {
        type: DataTypes.STRING,
        field: 'last_name'
    },
    age: {
        type: DataTypes.INTEGER,
        field: 'age'
    }
}, {
    tableName: 'users',
    // createdAt: 'created_at',
    // updatedAt: 'updated_at',
    timestamps: true,
    underscored: true
});

const Task = sequelize.define('Task', {
    title: {type: DataTypes.STRING },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'tasks',
    timestamps: false,
    underscored: true,
});


User.hasMany(Task);
Task.belongsTo(User);

sequelize.sync({ alter: true });

app.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.get('/users', async(req, res) => {
    try {
        const users = await User.findAll({ include: Task });
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id },
            include: Task
        })
        res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.update(req.body, {
            where: { id: req.params.id },
            returning: true,
        });
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});


app.delete('/users/:id', async (req, res) => {
    try {
        await User.destroy({ where: {id: req.params.id } });
        res.send({ message: 'User deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
})


// const result = await sequelize.transaction(async (t) => {
//     const user = await User.create({
//         name: 'Artem',
//         email: 'artem@mail.ru',
//         last_name: 'Ilyukhin',
//         age: 19,
//     }, { transaction: t });
//     await Task.create({ title: 'Learn SQL', user_id: user.id }, { transaction: t });
//     return user;
// })


const stats = await Task.findAll({
    attributes: [
        'user_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'taskCount'],
    ],
    group: ['user_id'],
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
