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
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
});

userSchema.pre('findOneAndDelete', async function (next) {
    try {
        const user = await this.model.findOne(this.getQuery()); // ZnajdŸ usuwanego u¿ytkownika
        if (!user) return next();

        const userId = user._id;

        // Usuñ powi¹zane ksi¹¿ki u¿ytkownika
        await UserBook.deleteMany({ userId });

        // Usuñ powi¹zane ksi¹¿ki z listy ¿yczeñ
        await UserWishlist.deleteMany({ userId });

        // Usuñ wymiany, gdzie u¿ytkownik jest userId lub userId2
        await Trade.deleteMany({ $or: [{ userId }, { userId2: userId }] });

        next();
    } catch (error) {
        console.error('B³¹d podczas usuwania powi¹zanych dokumentów:', error);
        next(error);
    }
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

userBookSchema.pre('findOneAndDelete', async function (next) {
    try {
        // Pobierz usuwany rekord UserBook
        const userBook = await this.model.findOne(this.getQuery());
        if (!userBook) return next();

        const userBookId = userBook._id;

        // Usuñ wymiany, w których usuwany UserBook jest u¿ywany
        await Trade.deleteMany({
            $or: [
                { selectedBooks1: userBookId },
                { selectedBooks2: userBookId },
            ],
        });

        next();
    } catch (error) {
        console.error('B³¹d podczas usuwania powi¹zanych wymian:', error);
        next(error);
    }
});


// Schemat i model dla listy ¿yczeñ u¿ytkownika
const userWishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    ownedDate: { type: Date, default: Date.now }, // Data dodania ksi¹¿ki
});

const UserWishlist = mongoose.model('UserWishlist', userWishlistSchema);


// Schemat i model dla wymiany ksi¹¿ek miêdzy u¿ytkownikami (z wieloma ksi¹¿kami)
const tradeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    selectedBooks1: [{ type: mongoose.Schema.Types.ObjectId , ref: 'UserBook'}], // Ksi¹¿ki u¿ytkownika 1
    selectedBooks2: [{ type: mongoose.Schema.Types.ObjectId ,  ref: 'UserBook'}], // Ksi¹¿ki u¿ytkownika 2
    tradeDate: { type: Date, default: Date.now }, // Data wymiany
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }, // Status wymiany
    reviewed: { type: Number, default: 0, required: true },
});

// Model wymiany ksi¹¿ek
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

        // Sprawdzamy, czy wszystkie wymagane dane s¹ obecne
        if (!userId || !tradeId || !message || !stars) {
            return res.status(400).json({ message: 'Wszystkie pola musz¹ byæ wype³nione' });
        }

        // Tworzymy now¹ opiniê
        const newOpinion = new Opinion({
            userId,
            tradeId,
            message,
            stars
        });

        // Zapisujemy opiniê w bazie danych
        await newOpinion.save();
        res.status(200).json({ message: 'Opinia zosta³a pomyœlnie dodana' });
    } catch (error) {
        console.error('B³¹d podczas dodawania opinii:', error);
        res.status(500).json({ message: 'B³¹d serwera', error });
    }
});


// Endpoint pobierania ksi¹¿ek z listy ¿yczeñ u¿ytkownika
app.get('/api/opinions/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const opinions = await Opinion.find({ userId });
        res.status(200).json(opinions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});



app.post('/api/trades', async (req, res) => {
    try {
        const { userId, userId2, selectedBooks1, selectedBooks2 } = req.body;

        // ZnajdŸ dokumenty UserBook dla przekazanych bookId
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
    const { tradeId } = req.params; // Pobierz ID wymiany z parametru œcie¿ki
    const { status } = req.body;   // Pobierz nowy status z cia³a ¿¹dania

    // SprawdŸ, czy nowy status jest dostarczony
    if (!status || !['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Nieprawid³owy status. Dozwolone wartoœci: pending, completed, cancelled.' });
    }

    try {
        // Zaktualizuj status wymiany
        const trade = await Trade.findByIdAndUpdate(
            tradeId,
            { status },
            { new: true } // Zwróæ zaktualizowany dokument
        );

        if (!trade) {
            return res.status(404).json({ message: 'Nie znaleziono wymiany o podanym ID.' });
        }

        res.status(200).json({ message: 'Status wymiany zosta³ zaktualizowany.', trade });
    } catch (error) {
        console.error('B³¹d podczas aktualizacji statusu wymiany:', error);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

app.post('/api/trades/:tradeId/reviewed', async (req, res) => {
    const { tradeId } = req.params; // Pobierz ID wymiany z parametru œcie¿ki
    const { reviewed } = req.body;   // Pobierz nowy status z cia³a ¿¹dania

    // SprawdŸ, czy nowy status jest dostarczony
    if (!reviewed || ![1, 0].includes(reviewed)) {
        return res.status(400).json({ message: 'Nieprawid³owy status. Dozwolone wartoœci: 1, 0' });
    }

    try {
        // Zaktualizuj status wymiany
        const trade = await Trade.findByIdAndUpdate(
            tradeId,
            { reviewed },
            { new: true } // Zwróæ zaktualizowany dokument
        );

        if (!trade) {
            return res.status(404).json({ message: 'Nie znaleziono wymiany o podanym ID.' });
        }

        res.status(200).json({ message: 'Status wymiany zosta³ zaktualizowany.', trade });
    } catch (error) {
        console.error('B³¹d podczas aktualizacji statusu wymiany:', error);
        res.status(500).json({ message: 'B³¹d serwera.' });
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
        res.status(500).json({ message: 'B³¹d serwera.' });
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
        console.error("B³¹d podczas pobierania wymian:", error);
        res.status(500).json({ message: "B³¹d serwera" });
    }
});


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

app.get('/api/user-books/:userBooksId', async (req, res) => {
    const { userBooksId } = req.params;

    try {
        const userBooks = await UserBook.find({ userBookId }).populate('userId');
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
        // ZnajdŸ UserBook na podstawie userId i bookId
        const userBook = await UserBook.findOne({ userId, bookId });

        if (!userBook) {
            return res.status(404).json({ message: 'Nie znaleziono powi¹zania u¿ytkownika z ksi¹¿k¹.' });
        }

        const userbooksId = userBook._id;

        // Usuñ rekord UserBook
        const result = await UserBook.findOneAndDelete({ userId, bookId });

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powi¹zania u¿ytkownika z ksi¹¿k¹.' });
        }

        // Usuñ wymiany o statusie pending, gdzie usuniêta ksi¹¿ka znajduje siê w selectedBooks1 lub selectedBooks2
        await Trade.deleteMany({
            status: 'pending',
            $or: [
                { selectedBooks1: userbooksId },
                { selectedBooks2: userbooksId }
            ]
        });

        res.status(200).json({ message: 'Ksi¹¿ka zosta³a usuniêta z pó³ki, a powi¹zane wymiany o statusie pending zosta³y usuniête.' });
    } catch (err) {
        console.error('B³¹d podczas usuwania UserBook lub wymian:', err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});



app.delete('/api/user-books/by-id/:userbooksId', async (req, res) => {
    const { userbooksId } = req.params; // Pobierz ID z parametru œcie¿ki

    if (!userbooksId) {
        return res.status(400).json({ message: 'Identyfikator ksi¹¿ki u¿ytkownika jest wymagany.' });
    }

    try {

        // Usuñ rekord UserBook na podstawie jego _id
        const result = await UserBook.findByIdAndDelete(userbooksId);

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono powi¹zania u¿ytkownika z ksi¹¿k¹.' });
        }

        // Usuñ wymiany o statusie pending, gdzie usuniêta ksi¹¿ka znajduje siê w selectedBooks1 lub selectedBooks2
        await Trade.deleteMany({
            status: 'pending',
            $or: [
                { selectedBooks1: userbooksId },
                { selectedBooks2: userbooksId }
            ]
        });

        res.status(200).json({ message: 'Ksi¹¿ka zosta³a usuniêta z pó³ki, a powi¹zane wymiany o statusie pending zosta³y usuniête.' });
    } catch (err) {
        console.error('B³¹d podczas usuwania UserBook lub wymian:', err);
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

/*// Endpoint GET, który zwraca username u¿ytkownika po _id
app.get('/api/users/:userId', async (req, res) => {
    try {
        // Pobranie u¿ytkownika z bazy na podstawie _id
        const user = await User.findById(userId);

        // Jeœli u¿ytkownik nie istnieje, zwróæ b³¹d 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Zwróæ tylko username
        res.json({ username: user.username });
    } catch (error) {
        // Jeœli wyst¹pi³ b³¹d, zwróæ status 500
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});*/

// Endpoint usuwania u¿ytkownika po ID
app.delete('/api/users/:userId', async (req, res) => {
    const { userId } = req.params; // Pobieramy userId z parametru URL

    if (!userId) {
        return res.status(400).json({ message: 'Identyfikator u¿ytkownika jest wymagany.' });
    }

    try {
        // Usuwanie u¿ytkownika na podstawie userId
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).json({ message: 'Nie znaleziono u¿ytkownika.' });
        }

        // Usuwanie powi¹zanych danych kaskadowo
        await UserBook.deleteMany({ userId }); // Usuñ ksi¹¿ki powi¹zane z u¿ytkownikiem
        await UserWishlist.deleteMany({ userId }); // Usuñ ksi¹¿ki z listy ¿yczeñ u¿ytkownika
        await Trade.deleteMany({ $or: [{ userId }, { userId2: userId }] }); // Usuñ wymiany ksi¹¿ek, w których uczestniczy³ u¿ytkownik
        await Opinion.deleteMany({ userId }); // Usuñ ksi¹¿ki powi¹zane z u¿ytkownikiem

        res.status(200).json({ message: 'U¿ytkownik i powi¹zane dane zosta³y usuniête.' });
    } catch (err) {
        console.error('B³¹d podczas usuwania u¿ytkownika:', err);
        res.status(500).json({ message: 'B³¹d serwera.' });
    }
});

app.delete('/api/trades/byid/:tradeId', async (req, res) => {
    try {
        const { tradeId } = req.params;

        // SprawdŸ, czy wymiana istnieje
        const trade = await Trade.findById(tradeId);

        if (!trade) {
            return res.status(404).json({ message: 'Wymiana nie istnieje' });
        }

        // Usuñ wymianê z bazy danych
        await Trade.findByIdAndDelete(tradeId);

        res.status(200).json({ message: 'Wymiana zosta³a usuniêta' });
    } catch (error) {
        console.error('B³¹d przy usuwaniu wymiany:', error);
        res.status(500).json({ message: 'B³¹d serwera', error: error.message });
    }
});





// Start serwera
app.listen(PORT, () => console.log(`Serwer dzia³a na http://localhost:${PORT}`));
