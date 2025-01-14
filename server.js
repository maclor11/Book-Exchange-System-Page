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

// Połączenie z MongoDB
mongoose.connect('mongodb://localhost:27017/logowanie', {
}).then(() => console.log('Połączono z MongoDB!'))
    .catch(err => console.error('Błąd połączenia z MongoDB:', err));

// Schemat i model użytkownika
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    isAdmin: { type: Number, required: true, default: 0 },
});

userSchema.pre('findOneAndDelete', async function (next) {
    try {
        const user = await this.model.findOne(this.getQuery()); // Znajdź usuwanego użytkownika
        if (!user) return next();

        const userId = user._id;

        // Usuń powiązane książki użytkownika
        await UserBook.deleteMany({ userId });

        // Usuń powiązane książki z listy życzeń
        await UserWishlist.deleteMany({ userId });

        // Usuń wymiany, gdzie użytkownik jest userId lub userId2
        await Trade.deleteMany({ $or: [{ userId }, { userId2: userId }] });

        next();
    } catch (error) {
        console.error('Błąd podczas usuwania powiązanych dokumentów:', error);
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

// Schemat i model książki
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    condition: { type: String, enum: ['nowa', 'uzywana'], required: true },
    coverType: { type: String, enum: ['miekka', 'twarda'], required: true},
});
const Book = mongoose.model('Book', bookSchema);

// Schemat i model dla relacji użytkownik-książka
const userBookSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    ownedDate: { type: Date, default: Date.now }, // Data dodania książki
});

const UserBook = mongoose.model('UserBook', userBookSchema);

userBookSchema.pre('findOneAndDelete', async function (next) {
    try {
        // Pobierz usuwany rekord UserBook
        const userBook = await this.model.findOne(this.getQuery());
        if (!userBook) return next();

        const userBookId = userBook._id;

        // Usuń wymiany, w których usuwany UserBook jest używany
        await Trade.deleteMany({
            $or: [
                { selectedBooks1: userBookId },
                { selectedBooks2: userBookId },
            ],
        });

        next();
    } catch (error) {
        console.error('Błąd podczas usuwania powiązanych wymian:', error);
        next(error);
    }
});


// Schemat i model dla listy życzeń użytkownika
const userWishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    ownedDate: { type: Date, default: Date.now }, // Data dodania książki
});

const UserWishlist = mongoose.model('UserWishlist', userWishlistSchema);


// Schemat i model dla wymiany książek między użytkownikami (z wieloma książkami)
const tradeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    selectedBooks1: [{ type: mongoose.Schema.Types.ObjectId , ref: 'UserBook'}], // Książki użytkownika 1
    selectedBooks2: [{ type: mongoose.Schema.Types.ObjectId ,  ref: 'UserBook'}], // Książki użytkownika 2
    tradeDate: { type: Date, default: Date.now }, // Data wymiany
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }, // Status wymiany
    reviewed: { type: Number, default: 0, required: true },
});

// Model wymiany książek
const Trade = mongoose.model('Trade', tradeSchema);

const opinionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
    message: { type: String, required: true },
    stars: { type: Number, required: true },
});

const Opinion = mongoose.model('Opinion', opinionSchema);

app.post('/api/opinions', async (req, res) => {
    try {
        const { userId, tradeId, message, stars } = req.body;

        // Sprawdzamy, czy wszystkie wymagane dane są obecne
        if (!userId || !tradeId || !message || !stars) {
            return res.status(400).json({ message: 'Wszystkie pola muszą być wypełnione' });
        }

        // Tworzymy nową opinię
        const newOpinion = new Opinion({
            userId,
            tradeId,
            message,
            stars
        });

        // Zapisujemy opinię w bazie danych
        await newOpinion.save();
        res.status(200).json({ message: 'Opinia została pomyślnie dodana' });
    } catch (error) {
        console.error('Błąd podczas dodawania opinii:', error);
        res.status(500).json({ message: 'Błąd serwera', error });
    }
});


// Endpoint pobierania książek z listy życzeń użytkownika
app.get('/api/opinions/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const opinions = await Opinion.find({ userId });
        res.status(200).json(opinions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});



app.post('/api/trades', async (req, res) => {
    try {
        const { userId, userId2, selectedBooks1, selectedBooks2 } = req.body;

        // Znajdź dokumenty UserBook dla przekazanych bookId
        const userBooks1 = await UserBook.find({ bookId: { $in: selectedBooks1 }, userId });
        const userBooks2 = await UserBook.find({ bookId: { $in: selectedBooks2 }, userId: userId2 });

        // Pobierz _id dokumentów UserBook
        const userBookIds1 = userBooks1.map(ub => ub._id);
        const userBookIds2 = userBooks2.map(ub => ub._id);

        const trade = new Trade({
            userId,
            userId2,
            selectedBooks1: userBookIds1,
            selectedBooks2: userBookIds2,
        });

        await trade.save();

        res.status(201).json({ message: 'Trade request created.', trade });
    } catch (error) {
        console.error('Error creating trade:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

app.post('/api/trades/:tradeId/status', async (req, res) => {
    const { tradeId } = req.params; // Pobierz ID wymiany z parametru ścieżki
    const { status } = req.body;   // Pobierz nowy status z ciała żądania

    // Sprawdź, czy nowy status jest dostarczony
    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Nieprawidłowy status. Dozwolone wartości: pending, completed, cancelled.' });
    }

    try {
        // Zaktualizuj status wymiany
        const trade = await Trade.findByIdAndUpdate(
            tradeId,
            { status },
            { new: true } // Zwróć zaktualizowany dokument
        );

        if (!trade) {
            return res.status(404).json({ message: 'Nie znaleziono wymiany o podanym ID.' });
        }

        res.status(200).json({ message: 'Status wymiany został zaktualizowany.', trade });
    } catch (error) {
        console.error('Błąd podczas aktualizacji statusu wymiany:', error);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

app.post('/api/trades/:tradeId/reviewed', async (req, res) => {
    const { tradeId } = req.params; // Pobierz ID wymiany z parametru ścieżki
    const { reviewed } = req.body;   // Pobierz nowy status z ciała żądania

    // Sprawdź, czy nowy status jest dostarczony
    if (!reviewed || ![1, 0].includes(reviewed)) {
        return res.status(400).json({ message: 'Nieprawidłowy status. Dozwolone wartości: 1, 0' });
    }

    try {
        // Zaktualizuj status wymiany
        const trade = await Trade.findByIdAndUpdate(
            tradeId,
            { reviewed },
            { new: true } // Zwróć zaktualizowany dokument
        );

        if (!trade) {
            return res.status(404).json({ message: 'Nie znaleziono wymiany o podanym ID.' });
        }

        res.status(200).json({ message: 'Status wymiany został zaktualizowany.', trade });
    } catch (error) {
        console.error('Błąd podczas aktualizacji statusu wymiany:', error);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});


app.get('/api/trades/by-id/:tradeId', async (req, res) => {
    try {
        const { tradeId } = req.params;

        const trade = await Trade.findById(tradeId);

        if (!trade) {
            return res.status(404).json({ message: 'Wymiana nie znaleziona' });
        }

        res.status(200).json(trade);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

app.get('/api/trades/by-user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

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

        res.status(200).json(trades);
    } catch (error) {
        console.error("Błąd podczas pobierania wymian:", error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});


// Endpoint dodawania książki na półkę użytkownika
app.post('/api/user-books', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator użytkownika i książki są wymagane.' });
    }

    try {
        const userExists = await User.findById(userId);
        const bookExists = await Book.findById(bookId);

        if (!userExists || !bookExists) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika lub książki.' });
        }

        const userBookExists = await UserBook.findOne({ userId, bookId });
        if (userBookExists) {
            return res.status(409).json({ message: 'Książka jest już na półce użytkownika.' });
        }

        const userBook = new UserBook({ userId, bookId });
        await userBook.save();

        res.status(201).json({ message: 'Książka została dodana do użytkownika.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Endpoint dodawania książki do listy życzeń użytkownika
app.post('/api/user-wishlist', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator użytkownika i książki są wymagane.' });
    }

    try {
        const userExists = await User.findById(userId);
        const bookExists = await Book.findById(bookId);

        if (!userExists || !bookExists) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika lub książki.' });
        }

        const userBookExists = await UserWishlist.findOne({ userId, bookId });
        if (userBookExists) {
            return res.status(409).json({ message: 'Książka jest już na półce użytkownika.' });
        }

        const userBook = new UserWishlist({ userId, bookId });
        await userBook.save();

        res.status(201).json({ message: 'Książka została dodana do użytkownika.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});


// Endpoint rejestracji użytkownika
app.post('/register', async (req, res) => {
    const { username, password, isAdmin } = req.body;

    try {
        // Sprawdzenie, czy użytkownik już istnieje
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Nazwa użytkownika już istnieje.' });
        }

        // Tworzenie nowego użytkownika
        const newUser = new User({ username, password, isAdmin});
        await newUser.save();
        res.status(201).json({ message: 'Rejestracja zakończona sukcesem!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Endpoint logowania użytkownika
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Nieprawidłowe dane logowania.' });
        }
        res.status(200).json({ message: 'Zalogowano pomyślnie!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Endpoint dodawania książki
app.post('/api/books', async (req, res) => {
    const { title, author, condition, coverType } = req.body;

    if (!title || !author || !condition || !coverType) {
        return res.status(400).json({ message: 'Tytuł i autor są wymagane.' });
    }

    try {
        const existingBook = await Book.findOne({ title, author, condition, coverType });
        if (existingBook) {
            return res.status(200).json(existingBook);
        }

        const newBook = new Book({ title, author, condition, coverType });
        await newBook.save();
        res.status(201).json({ message: 'Książka dodana pomyślnie!', _id: newBook._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Endpoint pobierania książek
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();

        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Endpoint pobierania książek użytkownika
app.get('/api/user-books/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userBooks = await UserBook.find({ userId }).populate('bookId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

app.get('/api/user-books/:userBooksId', async (req, res) => {
    const { userBooksId } = req.params;

    try {
        const userBooks = await UserBook.find({ userBookId }).populate('userId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Endpoint pobierania wszystkich książek użytkowników
app.get('/api/user-books', async (req, res) => {
    try {
        const userBooks = await UserBook.find().populate('bookId userId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error('Błąd podczas pobierania książek użytkowników:', err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});


// Endpoint wyszukiwania userId na podstawie username
app.get('/api/users/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
        }

        res.status(200).json({ userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});


app.get('/api/users/by-id/:_id', async (req, res) => {
    const { _id } = req.params;

    try {
        const user = await User.findById({ _id });
        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
        }

        res.status(200).json({ username: user.username});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

app.get('/api/users/by-id/status/:_id', async (req, res) => {
    const { _id } = req.params;

    try {
        const user = await User.findById({ _id });
        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
        }

        res.status(200).json({ isAdmin: user.isAdmin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});



// Endpoint pobierania książek z listy życzeń użytkownika
app.get('/api/user-wishlist/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userBooks = await UserWishlist.find({ userId }).populate('bookId');
        res.status(200).json(userBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});


// Endpoint usuwania książki z półki użytkownika
app.delete('/api/user-books', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator użytkownika i książki są wymagane.' });
    }

    try {
        // Znajdź UserBook na podstawie userId i bookId
        const userBook = await UserBook.findOne({ userId, bookId });

        if (!userBook) {
            return res.status(404).json({ message: 'Nie znaleziono powiązania użytkownika z książką.' });
        }

        const userbooksId = userBook._id;

        // Usuń rekord UserBook
        const result = await UserBook.findOneAndDelete({ userId, bookId });

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powiązania użytkownika z książką.' });
        }

        // Usuń wymiany o statusie pending, gdzie usunięta książka znajduje się w selectedBooks1 lub selectedBooks2
        await Trade.deleteMany({
            status: 'pending',
            $or: [
                { selectedBooks1: userbooksId },
                { selectedBooks2: userbooksId }
            ]
        });

        res.status(200).json({ message: 'Książka została usunięta z półki, a powiązane wymiany o statusie pending zostały usunięte.' });
    } catch (err) {
        console.error('Błąd podczas usuwania UserBook lub wymian:', err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});



app.delete('/api/user-books/by-id/:userbooksId', async (req, res) => {
    const { userbooksId } = req.params; // Pobierz ID z parametru ścieżki

    if (!userbooksId) {
        return res.status(400).json({ message: 'Identyfikator książki użytkownika jest wymagany.' });
    }

    try {

        // Usuń rekord UserBook na podstawie jego _id
        const result = await UserBook.findByIdAndDelete(userbooksId);

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powiązania użytkownika z książką.' });
        }

        // Usuń wymiany o statusie pending, gdzie usunięta książka znajduje się w selectedBooks1 lub selectedBooks2
        await Trade.deleteMany({
            status: 'pending',
            $or: [
                { selectedBooks1: userbooksId },
                { selectedBooks2: userbooksId }
            ]
        });

        res.status(200).json({ message: 'Książka została usunięta z półki, a powiązane wymiany o statusie pending zostały usunięte.' });
    } catch (err) {
        console.error('Błąd podczas usuwania UserBook lub wymian:', err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});




app.delete('/api/user-wishlist', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).json({ message: 'Identyfikator użytkownika i książki są wymagane.' });
    }

    try {
        const result = await UserWishlist.findOneAndDelete({ userId, bookId });

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powiązania użytkownika z książką.' });
        }

        res.status(200).json({ message: 'Książka została usunięta z półki.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});


// Endpoint pobierania listy wszystkich użytkowników
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find(); // Pobierz wszystkich użytkowników
        res.status(200).json(users); // Zwróć ich jako JSON
    } catch (err) {
        console.error('Błąd pobierania użytkowników:', err);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania użytkowników.' });
    }
});

/*// Endpoint GET, który zwraca username użytkownika po _id
app.get('/api/users/:userId', async (req, res) => {
    try {
        // Pobranie użytkownika z bazy na podstawie _id
        const user = await User.findById(userId);

        // Jeśli użytkownik nie istnieje, zwróć błąd 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Zwróć tylko username
        res.json({ username: user.username });
    } catch (error) {
        // Jeśli wystąpił błąd, zwróć status 500
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});*/

// Endpoint usuwania użytkownika po ID
app.delete('/api/users/:userId', async (req, res) => {
    const { userId } = req.params; // Pobieramy userId z parametru URL

    if (!userId) {
        return res.status(400).json({ message: 'Identyfikator użytkownika jest wymagany.' });
    }

    try {
        // Usuwanie użytkownika na podstawie userId
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
        }

        // Usuwanie powiązanych danych kaskadowo
        await UserBook.deleteMany({ userId }); // Usuń książki powiązane z użytkownikiem
        await UserWishlist.deleteMany({ userId }); // Usuń książki z listy życzeń użytkownika
        await Trade.deleteMany({ $or: [{ userId }, { userId2: userId }] }); // Usuń wymiany książek, w których uczestniczył użytkownik
        await Opinion.deleteMany({ userId }); // Usuń książki powiązane z użytkownikiem

        res.status(200).json({ message: 'Użytkownik i powiązane dane zostały usunięte.' });
    } catch (err) {
        console.error('Błąd podczas usuwania użytkownika:', err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

app.delete('/api/trades/byid/:tradeId', async (req, res) => {
    try {
        const { tradeId } = req.params;

        // Sprawdź, czy wymiana istnieje
        const trade = await Trade.findById(tradeId);

        if (!trade) {
            return res.status(404).json({ message: 'Wymiana nie istnieje' });
        }

        // Usuń wymianę z bazy danych
        await Trade.findByIdAndDelete(tradeId);

        res.status(200).json({ message: 'Wymiana została usunięta' });
    } catch (error) {
        console.error('Błąd przy usuwaniu wymiany:', error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
});





// Start serwera
app.listen(PORT, () => console.log(`Serwer działa na http://localhost:${PORT}`));
