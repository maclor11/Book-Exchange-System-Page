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

// Po��czenie z MongoDB
mongoose.connect('mongodb://localhost:27017/logowanie', {
}).then(() => console.log('Po��czono z MongoDB!'))
    .catch(err => console.error('B��d po��czenia z MongoDB:', err));

// Schemat i model u�ytkownika
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.pre('findOneAndDelete', async function (next) {
    try {
        const user = await this.model.findOne(this.getQuery()); // Znajd� usuwanego u�ytkownika
        if (!user) return next();

        const userId = user._id;

        // Usu� powi�zane ksi��ki u�ytkownika
        await UserBook.deleteMany({ userId });

        // Usu� powi�zane ksi��ki z listy �ycze�
        await UserWishlist.deleteMany({ userId });

        // Usu� wymiany, gdzie u�ytkownik jest userId lub userId2
        await Trade.deleteMany({ $or: [{ userId }, { userId2: userId }] });

        next();
    } catch (error) {
        console.error('B��d podczas usuwania powi�zanych dokument�w:', error);
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

// Schemat i model ksi��ki
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
});
const Book = mongoose.model('Book', bookSchema);

// Schemat i model dla relacji u�ytkownik-ksi��ka
const userBookSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    ownedDate: { type: Date, default: Date.now }, // Data dodania ksi��ki
});

const UserBook = mongoose.model('UserBook', userBookSchema);

// Schemat i model dla listy �ycze� u�ytkownika
const userWishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    ownedDate: { type: Date, default: Date.now }, // Data dodania ksi��ki
});

const UserWishlist = mongoose.model('UserWishlist', userWishlistSchema);


// Schemat i model dla wymiany ksi��ek mi�dzy u�ytkownikami (z wieloma ksi��kami)
const tradeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    selectedBooks1: [{ type: mongoose.Schema.Types.ObjectId , ref: 'UserBook'}], // Ksi��ki u�ytkownika 1
    selectedBooks2: [{ type: mongoose.Schema.Types.ObjectId ,  ref: 'UserBook'}], // Ksi��ki u�ytkownika 2
    tradeDate: { type: Date, default: Date.now }, // Data wymiany
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }, // Status wymiany
});

// Model wymiany ksi��ek
const Trade = mongoose.model('Trade', tradeSchema);



app.post('/api/trades', async (req, res) => {
    try {
        // Sprawd�, czy dane zosta�y wys�ane
        const { userId, userId2, selectedBooks1, selectedBooks2 } = req.body;

        // Walidacja danych
        if (!userId || !userId2) {
            return res.status(400).json({ message: 'Invalid data sent.' });
        }

        // Logowanie danych do konsoli
        console.log('Trade data:', req.body);

        // Utworzenie nowej wymiany
        const trade = new Trade({
            userId,
            userId2,
            selectedBooks1,
            selectedBooks2,
        });

        // Zapisz wymian� w bazie danych
        await trade.save();

        // Zwr�� sukces
        res.status(201).json({ message: 'Trade request created.', trade });
    } catch (error) {
        console.error('Error creating trade:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});


app.get('/api/trades/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const trades = await Trade.find({
            $or: [{ userId }, { userId2: userId }]
        })
            .populate({
                path: 'userId',
                select: 'username'
            })
            .populate({
                path: 'userId2',
                select: 'username'
            })
            .populate({
                path: 'selectedBooks1',
                populate: {
                    path: 'bookId',
                    model: 'Book',
                    select: 'title author'
                }
            })
            .populate({
                path: 'selectedBooks2',
                populate: {
                    path: 'bookId',
                    model: 'Book',
                    select: 'title author'
                }
            });

        if (!trades.length) {
            return res.status(404).json({ message: "Brak wymian dla tego u�ytkownika." });
        }

        res.status(200).json(trades);
    } catch (error) {
        console.error("B��d podczas pobierania wymian dla u�ytkownika:", error);
        res.status(500).json({ message: "B��d serwera" });
    }
});



// Endpoint dodawania ksi��ki na p�k� u�ytkownika
app.post('/api/user-books', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u�ytkownika i ksi��ki s� wymagane.' });
    }

    try {
        const userExists = await User.findById(userId);
        const bookExists = await Book.findById(bookId);

        if (!userExists || !bookExists) {
            return res.status(404).json({ message: 'Nie znaleziono u�ytkownika lub ksi��ki.' });
        }

        const userBookExists = await UserBook.findOne({ userId, bookId });
        if (userBookExists) {
            return res.status(409).json({ message: 'Ksi��ka jest ju� na p�ce u�ytkownika.' });
        }

        const userBook = new UserBook({ userId, bookId });
        await userBook.save();

        res.status(201).json({ message: 'Ksi��ka zosta�a dodana do u�ytkownika.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

// Endpoint dodawania ksi��ki do listy �ycze� u�ytkownika
app.post('/api/user-wishlist', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u�ytkownika i ksi��ki s� wymagane.' });
    }

    try {
        const userExists = await User.findById(userId);
        const bookExists = await Book.findById(bookId);

        if (!userExists || !bookExists) {
            return res.status(404).json({ message: 'Nie znaleziono u�ytkownika lub ksi��ki.' });
        }

        const userBookExists = await UserWishlist.findOne({ userId, bookId });
        if (userBookExists) {
            return res.status(409).json({ message: 'Ksi��ka jest ju� na p�ce u�ytkownika.' });
        }

        const userBook = new UserWishlist({ userId, bookId });
        await userBook.save();

        res.status(201).json({ message: 'Ksi��ka zosta�a dodana do u�ytkownika.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});


// Endpoint rejestracji u�ytkownika
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Sprawdzenie, czy u�ytkownik ju� istnieje
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Nazwa u�ytkownika ju� istnieje.' });
        }

        // Tworzenie nowego u�ytkownika
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'Rejestracja zako�czona sukcesem!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

// Endpoint logowania u�ytkownika
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Nieprawid�owe dane logowania.' });
        }
        res.status(200).json({ message: 'Zalogowano pomy�lnie!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

// Endpoint dodawania ksi��ki
app.post('/api/books', async (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: 'Tytu� i autor s� wymagane.' });
    }

    try {
        const existingBook = await Book.findOne({ title, author });
        if (existingBook) {
            return res.status(200).json(existingBook);
        }

        const newBook = new Book({ title, author });
        await newBook.save();
        res.status(201).json({ message: 'Ksi��ka dodana pomy�lnie!', _id: newBook._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

// Endpoint pobierania ksi��ek
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();

        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

// Endpoint pobierania ksi��ek u�ytkownika
app.get('/api/user-books/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userBooks = await UserBook.find({ userId }).populate('bookId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

app.get('/api/user-books/:userBooksId', async (req, res) => {
    const { userBooksId } = req.params;

    try {
        const userBooks = await UserBook.find({ userBookId }).populate('userId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

// Endpoint pobierania wszystkich ksi��ek u�ytkownik�w
app.get('/api/user-books', async (req, res) => {
    try {
        const userBooks = await UserBook.find().populate('bookId userId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error('B��d podczas pobierania ksi��ek u�ytkownik�w:', err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});


// Endpoint wyszukiwania userId na podstawie username
app.get('/api/users/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono u�ytkownika.' });
        }

        res.status(200).json({ userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});



// Endpoint pobierania ksi��ek z listy �ycze� u�ytkownika
app.get('/api/user-wishlist/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userBooks = await UserWishlist.find({ userId }).populate('bookId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});


// Endpoint usuwania ksi��ki z p�ki u�ytkownika
app.delete('/api/user-books', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u�ytkownika i ksi��ki s� wymagane.' });
    }

    try {
        const result = await UserBook.findOneAndDelete({ userId, bookId });

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powi�zania u�ytkownika z ksi��k�.' });
        }

        res.status(200).json({ message: 'Ksi��ka zosta�a usuni�ta z p�ki.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});

app.delete('/api/user-wishlist', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator u�ytkownika i ksi��ki s� wymagane.' });
    }

    try {
        const result = await UserWishlist.findOneAndDelete({ userId, bookId });

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powi�zania u�ytkownika z ksi��k�.' });
        }

        res.status(200).json({ message: 'Ksi��ka zosta�a usuni�ta z p�ki.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});


// Endpoint pobierania listy wszystkich u�ytkownik�w
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find(); // Pobierz wszystkich u�ytkownik�w
        res.status(200).json(users); // Zwr�� ich jako JSON
    } catch (err) {
        console.error('B��d pobierania u�ytkownik�w:', err);
        res.status(500).json({ message: 'B��d serwera podczas pobierania u�ytkownik�w.' });
    }
});

// Endpoint GET, kt�ry zwraca username u�ytkownika po _id
app.get('/api/users/:userId', async (req, res) => {
    try {
        // Pobranie u�ytkownika z bazy na podstawie _id
        const user = await User.findById(userId);

        // Je�li u�ytkownik nie istnieje, zwr�� b��d 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Zwr�� tylko username
        res.json({ username: user.username });
    } catch (error) {
        // Je�li wyst�pi� b��d, zwr�� status 500
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint usuwania u�ytkownika po ID
app.delete('/api/users/:userId', async (req, res) => {
    const { userId } = req.params; // Pobieramy userId z parametru URL

    if (!userId) {
        return res.status(400).json({ message: 'Identyfikator u�ytkownika jest wymagany.' });
    }

    try {
        // Usuwanie u�ytkownika na podstawie userId
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono u�ytkownika.' });
        }

        // Usuwanie powi�zanych danych kaskadowo
        await UserBook.deleteMany({ userId }); // Usu� ksi��ki powi�zane z u�ytkownikiem
        await UserWishlist.deleteMany({ userId }); // Usu� ksi��ki z listy �ycze� u�ytkownika
        await Trade.deleteMany({ $or: [{ userId }, { userId2: userId }] }); // Usu� wymiany ksi��ek, w kt�rych uczestniczy� u�ytkownik

        res.status(200).json({ message: 'U�ytkownik i powi�zane dane zosta�y usuni�te.' });
    } catch (err) {
        console.error('B��d podczas usuwania u�ytkownika:', err);
        res.status(500).json({ message: 'B��d serwera.' });
    }
});






// Start serwera
app.listen(PORT, () => console.log(`Serwer dzia�a na http://localhost:${PORT}`));
