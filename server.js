const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Po³¹czenie z MongoDB
mongoose.connect('mongodb://localhost:27017/logowanie', {
}).then(() => console.log('Po³¹czono z MongoDB!'))
    .catch(err => console.error('B³¹d po³¹czenia z MongoDB:', err));

// Schemat i model u¿ytkownika
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Schemat i model ksi¹¿ki
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
});
const Book = mongoose.model('Book', bookSchema);

// Schemat i model dla relacji u¿ytkownik-ksi¹¿ka
const userBookSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    ownedDate: { type: Date, default: Date.now }, // Data dodania ksi¹¿ki
});

const UserBook = mongoose.model('UserBook', userBookSchema);

// Schemat i model dla listy ¿yczeñ u¿ytkownika
const userWishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    ownedDate: { type: Date, default: Date.now }, // Data dodania ksi¹¿ki
});

const UserWishlist = mongoose.model('UserWishlist', userWishlistSchema);



// Endpoint dodawania ksi¹¿ki na pó³kê u¿ytkownika
app.post('/api/user-books', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u¿ytkownika i ksi¹¿ki s¹ wymagane.' });
    }

    try {
        const userExists = await User.findById(userId);
        const bookExists = await Book.findById(bookId);

        if (!userExists || !bookExists) {
            return res.status(404).json({ message: 'Nie znaleziono u¿ytkownika lub ksi¹¿ki.' });
        }

        const userBookExists = await UserBook.findOne({ userId, bookId });
        if (userBookExists) {
            return res.status(409).json({ message: 'Ksi¹¿ka jest ju¿ na pó³ce u¿ytkownika.' });
        }

        const userBook = new UserBook({ userId, bookId });
        await userBook.save();

        res.status(201).json({ message: 'Ksi¹¿ka zosta³a dodana do u¿ytkownika.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

// Endpoint dodawania ksi¹¿ki do listy ¿yczeñ u¿ytkownika
app.post('/api/user-wishlist', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u¿ytkownika i ksi¹¿ki s¹ wymagane.' });
    }

    try {
        const userExists = await User.findById(userId);
        const bookExists = await Book.findById(bookId);

        if (!userExists || !bookExists) {
            return res.status(404).json({ message: 'Nie znaleziono u¿ytkownika lub ksi¹¿ki.' });
        }

        const userBookExists = await UserWishlist.findOne({ userId, bookId });
        if (userBookExists) {
            return res.status(409).json({ message: 'Ksi¹¿ka jest ju¿ na pó³ce u¿ytkownika.' });
        }

        const userBook = new UserWishlist({ userId, bookId });
        await userBook.save();

        res.status(201).json({ message: 'Ksi¹¿ka zosta³a dodana do u¿ytkownika.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});


// Endpoint rejestracji u¿ytkownika
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Sprawdzenie, czy u¿ytkownik ju¿ istnieje
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Nazwa u¿ytkownika ju¿ istnieje.' });
        }

        // Tworzenie nowego u¿ytkownika
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'Rejestracja zakoñczona sukcesem!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

// Endpoint logowania u¿ytkownika
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Nieprawid³owe dane logowania.' });
        }
        res.status(200).json({ message: 'Zalogowano pomyœlnie!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

// Endpoint dodawania ksi¹¿ki
app.post('/api/books', async (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: 'Tytu³ i autor s¹ wymagane.' });
    }

    try {
        const existingBook = await Book.findOne({ title, author });
        if (existingBook) {
            return res.status(200).json(existingBook);
        }

        const newBook = new Book({ title, author });
        await newBook.save();
        res.status(201).json({ message: 'Ksi¹¿ka dodana pomyœlnie!', _id: newBook._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

// Endpoint pobierania ksi¹¿ek
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();

        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

// Endpoint pobierania ksi¹¿ek u¿ytkownika
app.get('/api/user-books/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userBooks = await UserBook.find({ userId }).populate('bookId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

// Endpoint pobierania wszystkich ksi¹¿ek u¿ytkowników
app.get('/api/user-books', async (req, res) => {
    try {
        const userBooks = await UserBook.find().populate('bookId userId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error('B³¹d podczas pobierania ksi¹¿ek u¿ytkowników:', err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});


// Endpoint wyszukiwania userId na podstawie username
app.get('/api/users/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono u¿ytkownika.' });
        }

        res.status(200).json({ userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});



// Endpoint pobierania ksi¹¿ek z listy ¿yczeñ u¿ytkownika
app.get('/api/user-wishlist/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userBooks = await UserWishlist.find({ userId }).populate('bookId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});


// Endpoint usuwania ksi¹¿ki z pó³ki u¿ytkownika
app.delete('/api/user-books', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u¿ytkownika i ksi¹¿ki s¹ wymagane.' });
    }

    try {
        const result = await UserBook.findOneAndDelete({ userId, bookId });

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powi¹zania u¿ytkownika z ksi¹¿k¹.' });
        }

        res.status(200).json({ message: 'Ksi¹¿ka zosta³a usuniêta z pó³ki.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

app.delete('/api/user-wishlist', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u¿ytkownika i ksi¹¿ki s¹ wymagane.' });
    }

    try {
        const result = await UserWishlist.findOneAndDelete({ userId, bookId });

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powi¹zania u¿ytkownika z ksi¹¿k¹.' });
        }

        res.status(200).json({ message: 'Ksi¹¿ka zosta³a usuniêta z pó³ki.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});


// Endpoint pobierania listy wszystkich u¿ytkowników
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find(); // Pobierz wszystkich u¿ytkowników
        res.status(200).json(users); // Zwróæ ich jako JSON
    } catch (err) {
        console.error('B³¹d pobierania u¿ytkowników:', err);
        res.status(500).json({ message: 'B³¹d serwera podczas pobierania u¿ytkowników.' });
    }
});






// Start serwera
app.listen(PORT, () => console.log(`Serwer dzia³a na http://localhost:${PORT}`));
