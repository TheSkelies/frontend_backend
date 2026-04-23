const mongoose = require('mongoose');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost:27017/fb_database')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

app.use(express.json());


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 18 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);


app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});


app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const users = await User.find(u => u.id === req.params.id);
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});


app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});



app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});