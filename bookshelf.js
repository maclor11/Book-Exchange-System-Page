


// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wy?wietlenie nazwy u¿ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeœli brak nazwy, wraca do logowania
}

// Dodawanie nowej ksi¹¿ki
async function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        let mess = "Proszê wype³niæ oba pola";
        alert(mess);
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazwê u¿ytkownika z localStorage

        if (!username) {
            alert('Musisz byæ zalogowany, aby dodaæ ksi¹¿kê na pó³kê.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo¿na znaleŸæ u¿ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // SprawdŸ, czy ksi¹¿ka ju¿ istnieje w bazie danych
        const existingBooksResponse = await fetch('http://localhost:3000/api/books');
        if (!existingBooksResponse.ok) {
            alert('B³¹d podczas sprawdzania istniej¹cych ksi¹¿ek.');
            return;
        }

        const existingBooks = await existingBooksResponse.json();
        const existingBook = existingBooks.find(book => book.title === title && book.author === author);

        let bookId;

        if (existingBook) {
            // Je?li ksi¹¿ka istnieje, u¿yj jej ID
            bookId = existingBook._id;
        } else {
            // Je?li ksi¹¿ka nie istnieje, dodaj j¹ do bazy danych
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author }),
            });

            if (!response.ok) {
                alert('B³¹d podczas dodawania ksi¹¿ki.');
                return;
            }

            const newBook = await response.json();
            if (!newBook || !newBook._id) {
                alert('Serwer nie zwróci³ ID nowej ksi¹¿ki.');
                return;
            }

            bookId = newBook._id; // Ustaw `bookId` na wartoœæ zwrócon¹ przez serwer
        }

        // Dodaj ksi¹¿kê na pó³kê u¿ytkownika
        const shelfResponse = await fetch('http://localhost:3000/api/user-books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (shelfResponse.ok) {
            alert('Ksi¹¿ka zosta³a pomyœlnie dodana na pó³kê!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            displayShelf(); // Odœwie¿ pó³kê
            fetchBooks();
        } else {
            alert('B³¹d podczas dodawania ksi¹¿ki na pó³kê.');
        }
    } catch (error) {
        console.error('Wyst¹pi³ b³¹d:', error);
        alert('Wyst¹pi³ b³¹d podczas komunikacji z serwerem.');
    }
}


async function displayShelf() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz byæ zalogowany, aby zobaczyæ swoj¹ pó³kê.');
        return;
    }

    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo¿na znaleŸæ u¿ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz ksi¹¿ki u?ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId}`);
        const userBooks = await response.json();

        // Pobierz kontener pó³ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczyœæ pó³kê

        // Wy?wietl ksi??ki na pó?ce
        userBooks.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> ${bookId.author}</p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
                <button onclick="removeBookFromShelf('${bookId._id}')">Usuñ</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            shelf.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B³¹d podczas ³adowania pó³ki:', error);
        alert('Wyst¹pi³ b³¹d podczas ³adowania pó³ki.');
    }
}

async function addBookToWishlist() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        alert('Proszê wype³niæ oba pola!');
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazw? u?ytkownika z localStorage

        if (!username) {
            alert('Musisz byæ zalogowany, aby dodaæ ksi¹¿kê na listê ¿yczeñ.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo¿na znaleŸæ u¿ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // SprawdŸ, czy ksi¹¿ka ju¿ istnieje w bazie danych
        const existingBooksResponse = await fetch('http://localhost:3000/api/books');
        if (!existingBooksResponse.ok) {
            alert('B³¹d podczas sprawdzania istniej¹cych ksi¹¿ek.');
            return;
        }

        const existingBooks = await existingBooksResponse.json();
        const existingBook = existingBooks.find(book => book.title === title && book.author === author);

        let bookId;

        if (existingBook) {
            // Jeœli ksi¹¿ka istnieje, u¿yj jej ID
            bookId = existingBook._id;
        } else {
            // Je?li ksi¹¿ka nie istnieje, dodaj j¹ do bazy danych
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author }),
            });

            if (!response.ok) {
                alert('B³¹d podczas dodawania ksi¹¿ki.');
                return;
            }

            const newBook = await response.json();
            if (!newBook || !newBook._id) {
                alert('Serwer nie zwróci³ ID nowej ksi¹¿ki.');
                return;
            }

            bookId = newBook._id; // Ustaw `bookId` na wartoœæ zwrócon¹ przez serwer
        }

        // Dodaj ksi¹¿kê na pó³kê u¿ytkownika
        const shelfResponse = await fetch('http://localhost:3000/api/user-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (shelfResponse.ok) {
            alert('Ksi¹¿ka zosta³a pomyœlnie dodana na listê ¿yczeñ!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            displayWishlist();
            fetchBooks();
        } else {
            alert('B³¹d podczas dodawania ksi¹¿ki na listê ¿yczeñ.');
        }
    } catch (error) {
        console.error('Wyst¹pi³ b³¹d:', error);
        alert('Wyst¹pi³ b³¹d podczas komunikacji z serwerem.');
    }
}

async function displayWishlist() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz byæ zalogowany, aby zobaczyæ swoj¹ listê ¿yczeñ.');
        return;
    }

    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo¿na znaleŸæ u¿ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz ksi¹¿ki u¿ytkownika
        const response = await fetch(`http://localhost:3000/api/user-wishlist/${userId}`);
        const userWishlist = await response.json();

        // Pobierz kontener listy
        const wishlist = document.getElementById('wishlist');
        wishlist.innerHTML = ''; // Wyczyœæ listê

        // Wy?wietl ksi¹¿ki na liœcie
        userWishlist.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> ${bookId.author}</p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
                <button onclick="removeBookFromWishlist('${bookId._id}')">Usuñ</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            wishlist.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B³¹d podczas ³adowania pó³ki:', error);
        alert('Wyst?pi? b??d podczas ?adowania pó?ki.');
    }
}

async function removeBookFromShelf(bookId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz byæ zalogowany, aby usun¹æ ksi¹¿kê.');
        return;
    }

    try {
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        const userData = await userResponse.json();
        const userId = userData.userId;

        const response = await fetch('http://localhost:3000/api/user-books', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (response.ok) {
            alert('Ksi¹¿ka zosta³a usuniêta z pó³ki!');
            displayShelf();
        } else {
            alert('B³¹d podczas usuwania ksi¹¿ki.');
        }
    } catch (error) {
        console.error('B³¹d:', error);
        alert('Wystapil b³¹d podczas komunikacji z serwerem.');
    }
}

async function removeBookFromWishlist(bookId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz byæ zalogowany, aby usun¹æ ksi¹¿kê.');
        return;
    }

    try {
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        const userData = await userResponse.json();
        const userId = userData.userId;

        const response = await fetch('http://localhost:3000/api/user-wishlist', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (response.ok) {
            alert('Ksi¹¿ka zosta³a usuniêta z listy ¿yczeñ!');
            displayWishlist();
        } else {
            alert('B³¹d podczas usuwania ksi¹¿ki.');
        }
    } catch (error) {
        console.error('B³¹d:', error);
        alert('Wystapi³ b³¹d podczas komunikacji z serwerem.');
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}






// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);


window.onload = () => {
    displayShelf();
    displayWishlist();
    updateDateTime();
};


// Funkcja wylogowania 
function logout() {
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

function bookshelf() {
    window.location.href = 'bookshelf.html';
}

function dashboard() {
    window.location.href = 'dashboard.html';
}

let allBooks = []; // Bufor na ksi¹¿ki pobrane z serwera

// Pobierz ksi¹¿ki z bazy danych przy za³adowaniu strony
async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/api/books');
        if (response.ok) {
            allBooks = await response.json();
        }
    } catch (error) {
        console.error('Blad podczas pobierania ksiazek:', error);
    }
}

// Wyœwietl podpowiedzi na podstawie wpisywanego tekstu
function showSuggestions(field) {
    const input = document.getElementById(`book${capitalize(field)}`);
    const suggestionsDiv = document.getElementById(`${field}Suggestions`);
    const query = input.value.toLowerCase();

    // Wyczyœæ istniej¹ce podpowiedzi
    suggestionsDiv.innerHTML = '';

    if (!query) return; // Brak tekstu -> brak podpowiedzi

    // Filtruj ksi¹¿ki na podstawie wpisywanego tekstu
    const suggestions = allBooks
        .filter(book => book[field].toLowerCase().includes(query))
        .slice(0, 5); // Maksymalnie 5 podpowiedzi

    // Dodaj podpowiedzi do kontenera
    suggestions.forEach(book => {
        const suggestion = document.createElement('div');
        suggestion.textContent = book[field];
        suggestion.onclick = () => {
            input.value = book[field]; // Ustaw wartoœæ pola na wybran¹ podpowiedŸ
            suggestionsDiv.innerHTML = ''; // Wyczyœæ podpowiedzi
        };
        suggestionsDiv.appendChild(suggestion);
    });
}

// Pomocnicza funkcja do formatowania nazw pól
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Wywo?anie fetchBooks przy za³adowaniu strony
document.addEventListener('DOMContentLoaded', fetchBooks);


