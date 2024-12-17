const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Po³¹czenie z MongoDB
mongoose.connect('mongodb://localhost:27017/logowanie')
    .then(() => console.log('Po³¹czono z MongoDB!'))
    .catch(err => console.error('B³¹d po³¹czenia z MongoDB:', err));

// Model u¿ytkownika
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Endpoint rejestracji
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Sprawdzenie, czy u¿ytkownik ju¿ istnieje
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Nazwa uzytkownika juz istnieje.' });
        }

        // Tworzenie nowego u¿ytkownika
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'Rejestracja zakonczona sukcesem!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Blad serwera.' });
    }
});


// Endpoint logowania
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Nieprawidlowe dane logowania.' });
        }
        res.status(200).json({ message: 'Zalogowano pomyslnie!' });
    } catch (error) {
        res.status(500).json({ message: 'Blad serwera.' });
    }
});

// Start serwera
app.listen(PORT, () => console.log(`Serwer dziala na http://localhost:${PORT}`));
