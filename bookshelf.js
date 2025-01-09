


// Pobranie nazwy użytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wy?wietlenie nazwy użytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeśli brak nazwy, wraca do logowania
}

// Dodawanie nowej książki
async function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const condition = document.getElementById('bookCondition').value;
    const coverType = document.getElementById('bookCover').value;

    if (!title || !author || !condition || !coverType) {
        alert('Proszę wypełnić wszystkie pola!');
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazwę użytkownika z localStorage

        if (!username) {
            alert('Musisz być zalogowany, aby dodać książkę na półkę.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie można znaleźć użytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Sprawdź, czy książka już istnieje w bazie danych
        const existingBooksResponse = await fetch('http://localhost:3000/api/books');
        if (!existingBooksResponse.ok) {
            alert('Błąd podczas sprawdzania istniejących książek.');
            return;
        }

        const existingBooks = await existingBooksResponse.json();
        const existingBook = existingBooks.find(book => book.title === title && book.author === author && book.condition === condition && book.coverType === coverType);

        let bookId;

        if (existingBook) {
            // Jeśli książka istnieje, użyj jej ID
            bookId = existingBook._id;
        } else {
            // Jeśli książka nie istnieje, dodaj ją do bazy danych
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author, condition, coverType }),
            });

            if (!response.ok) {
                alert('Błąd podczas dodawania książki.');
                return;
            }

            const newBook = await response.json();
            if (!newBook || !newBook._id) {
                alert('Serwer nie zwrócił ID nowej książki.');
                return;
            }

            bookId = newBook._id; // Ustaw `bookId` na wartość zwróconą przez serwer
        }

        // Dodaj książkę na półkę użytkownika
        const shelfResponse = await fetch('http://localhost:3000/api/user-books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (shelfResponse.ok) {
            alert('Książka została pomyślnie dodana na półkę!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            document.getElementById('bookCondition').value = '';
            document.getElementById('bookCover').value = '';
            displayShelf(); // Odśwież półkę
            fetchBooks();
        } else {
            alert('Błąd podczas dodawania książki na półkę.');
        }
    } catch (error) {
        console.error('Wystąpił błąd:', error);
        alert('Wystąpił błąd podczas komunikacji z serwerem.');
    }
}

async function addBookToWishlist() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const condition = document.getElementById('bookCondition').value;
    const coverType = document.getElementById('bookCover').value;

    if (!title || !author || !condition || !coverType) {
        alert('Proszę wypełnić wszystkie pola!');
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazw? u?ytkownika z localStorage

        if (!username) {
            alert('Musisz być zalogowany, aby dodać książkę na listę życzeń.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie można znaleźć użytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Sprawdź, czy książka już istnieje w bazie danych
        const existingBooksResponse = await fetch('http://localhost:3000/api/books');
        if (!existingBooksResponse.ok) {
            alert('Błąd podczas sprawdzania istniejących książek.');
            return;
        }

        const existingBooks = await existingBooksResponse.json();
        const existingBook = existingBooks.find(book => book.title === title && book.author === author && book.condition === condition && book.coverType === coverType);

        let bookId;

        if (existingBook) {
            // Jeśli książka istnieje, użyj jej ID
            bookId = existingBook._id;
        } else {
            // Je?li książka nie istnieje, dodaj ją do bazy danych
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author, condition, coverType}),
            });

            if (!response.ok) {
                alert('Błąd podczas dodawania książki.');
                return;
            }

            const newBook = await response.json();
            if (!newBook || !newBook._id) {
                alert('Serwer nie zwrócił ID nowej książki.');
                return;
            }

            bookId = newBook._id; // Ustaw `bookId` na wartość zwróconą przez serwer
        }

        // Dodaj książkę na półkę użytkownika
        const shelfResponse = await fetch('http://localhost:3000/api/user-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (shelfResponse.ok) {
            alert('Książka została pomyślnie dodana na listę życzeń!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            document.getElementById('bookCondition').value = '';
            document.getElementById('bookCover').value = '';
            displayWishlist();
            fetchBooks();
        } else {
            alert('Błąd podczas dodawania książki na listę życzeń.');
        }
    } catch (error) {
        console.error('Wystąpił błąd:', error);
        alert('Wystąpił błąd podczas komunikacji z serwerem.');
    }
}


async function displayShelf() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz być zalogowany, aby zobaczyć swoją półkę.');
        return;
    }

    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie można znaleźć użytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz książki u?ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId}`);
        const userBooks = await response.json();

        // Pobierz kontener półki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczyść półkę

        // Wy?wietl ksi??ki na pó?ce
        userBooks.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
            <p><strong>Autor:</strong><br> <span title="${bookId.author}">${bookId.author}</span></p>
            <p><strong>Stan:</strong> ${bookId.condition || 'Nieznany'}</p>
            <p><strong>Okładka:</strong> ${bookId.coverType || 'Nieznana'}</p>
            <button onclick="removeBookFromShelf('${bookId._id}')">Usuń</button>
        `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            shelf.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania dółki:', error);
        alert('Wystąpił błąd podczas ładowania dółki.');
    }
}



async function displayWishlist() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz być zalogowany, aby zobaczyć swoją listę życzeń.');
        return;
    }

    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie można znaleźć użytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz książki użytkownika
        const response = await fetch(`http://localhost:3000/api/user-wishlist/${userId}`);
        const userWishlist = await response.json();


        // Pobierz kontener listy
        const wishlist = document.getElementById('wishlist');
        wishlist.innerHTML = ''; // Wyczyść listę


        // Wy?wietl książki na liście
        userWishlist.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong>`;


            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> <br><span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Stan:</strong> ${bookId.condition}</p>
                <p><strong>Okładka:</strong> ${bookId.coverType}</p>
                <button onclick="removeBookFromWishlist('${bookId._id}')">Usuń</button>
            `;


            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            wishlist.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania półki:', error);
        alert('Wyst?pi? b??d podczas ?adowania pó?ki.');
    }
}

async function removeBookFromShelf(bookId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz być zalogowany, aby usunąć książkę.');
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
            alert('Książka została usunięta z półki!');
            displayShelf();
        } else {
            alert('Błąd podczas usuwania książki.');
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystapil błąd podczas komunikacji z serwerem.');
    }
}

async function removeBookFromWishlist(bookId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz być zalogowany, aby usunąć książkę.');
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
            alert('Książka została usunięta z listy życzeń!');
            displayWishlist();
        } else {
            alert('Błąd podczas usuwania książki.');
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystapił błąd podczas komunikacji z serwerem.');
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}


// Aktualizacja co sekundę
setInterval(updateDateTime, 1000);


window.onload = () => {
    displayShelf();
    displayWishlist();
    updateDateTime();
};


// Funkcja wylogowania 
function logout() {
    localStorage.removeItem('username');
    window.location.href = 'questDashboard.html';
}

function bookshelf() {
    window.location.href = 'bookshelf.html';
}

function dashboard() {
    window.location.href = 'userDashboard.html';
}

let allBooks = []; // Bufor na książki pobrane z serwera

// Pobierz książki z bazy danych przy załadowaniu strony
async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/api/books');
        if (response.ok) {
            allBooks = await response.json();
        }
    } catch (error) {
        console.error('Błąd podczas pobierania książek:', error);
    }
}

// Wyświetl podpowiedzi na podstawie wpisywanego tekstu
function showSuggestions(field) {
    const input = document.getElementById(`book${capitalize(field)}`);
    const suggestionsDiv = document.getElementById(`${field}Suggestions`);
    const query = input.value.toLowerCase();

    // Wyczyść istniejące podpowiedzi
    suggestionsDiv.innerHTML = '';

    if (!query) return; // Brak tekstu -> brak podpowiedzi

    // Filtruj książki na podstawie wpisywanego tekstu
    const uniqueSuggestions = Array.from(
        new Set(
            allBooks
                .map(book => book[field])
                .filter(value => value && value.toLowerCase().includes(query)) // Filtruj tylko te, które pasują do zapytania
        )
    ).slice(0, 5); // Maksymalnie 5 unikalnych podpowiedzi

    // Dodaj podpowiedzi do kontenera
    uniqueSuggestions.forEach(value => {
        const suggestion = document.createElement('div');
        suggestion.textContent = value;
        suggestion.onclick = () => {
            input.value = value; // Ustaw wartość pola na wybraną podpowiedź
            suggestionsDiv.innerHTML = ''; // Wyczyść podpowiedzi

            // Jeśli wybrano tytuł, automatycznie uzupełnij autora
            if (field === 'title') {
                const matchingBook = allBooks.find(book => book.title === value);
                if (matchingBook) {
                    const authorInput = document.getElementById('bookAuthor');
                    authorInput.value = matchingBook.author; // Ustaw autora na podstawie wybranego tytułu
                }
            }
        };
        suggestionsDiv.appendChild(suggestion);
    });
}

// Pomocnicza funkcja do formatowania nazw pól
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// Wywo?anie fetchBooks przy załadowaniu strony
document.addEventListener('DOMContentLoaded', fetchBooks);

function animateAddToShelf() {  
    addBook(); // Funkcja dodająca książkę do półki) 
}

function animateAddToWishlist() {
    addBookToWishlist(); // Funkcja dodająca książkę do listy życzeń
}

document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('shelf');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('wishlist');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});




