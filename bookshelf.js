


// Pobranie nazwy u�ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wy?wietlenie nazwy u�ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Je�li brak nazwy, wraca do logowania
}

// Dodawanie nowej ksi��ki
async function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        let mess = "Prosz� wype�ni� oba pola";
        alert(mess);
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazw� u�ytkownika z localStorage

        if (!username) {
            alert('Musisz by� zalogowany, aby doda� ksi��k� na p�k�.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Sprawd�, czy ksi��ka ju� istnieje w bazie danych
        const existingBooksResponse = await fetch('http://localhost:3000/api/books');
        if (!existingBooksResponse.ok) {
            alert('B��d podczas sprawdzania istniej�cych ksi��ek.');
            return;
        }

        const existingBooks = await existingBooksResponse.json();
        const existingBook = existingBooks.find(book => book.title === title && book.author === author);

        let bookId;

        if (existingBook) {
            // Je?li ksi��ka istnieje, u�yj jej ID
            bookId = existingBook._id;
        } else {
            // Je?li ksi��ka nie istnieje, dodaj j� do bazy danych
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author }),
            });

            if (!response.ok) {
                alert('B��d podczas dodawania ksi��ki.');
                return;
            }

            const newBook = await response.json();
            if (!newBook || !newBook._id) {
                alert('Serwer nie zwr�ci� ID nowej ksi��ki.');
                return;
            }

            bookId = newBook._id; // Ustaw `bookId` na warto�� zwr�con� przez serwer
        }

        // Dodaj ksi��k� na p�k� u�ytkownika
        const shelfResponse = await fetch('http://localhost:3000/api/user-books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (shelfResponse.ok) {
            alert('Ksi��ka zosta�a pomy�lnie dodana na p�k�!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            displayShelf(); // Od�wie� p�k�
            fetchBooks();
        } else {
            alert('B��d podczas dodawania ksi��ki na p�k�.');
        }
    } catch (error) {
        console.error('Wyst�pi� b��d:', error);
        alert('Wyst�pi� b��d podczas komunikacji z serwerem.');
    }
}


async function displayShelf() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz by� zalogowany, aby zobaczy� swoj� p�k�.');
        return;
    }

    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz ksi��ki u?ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId}`);
        const userBooks = await response.json();

        // Pobierz kontener p�ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczy�� p�k�

        // Wy?wietl ksi??ki na p�?ce
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
                <button onclick="removeBookFromShelf('${bookId._id}')">Usu�</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            shelf.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B��d podczas �adowania p�ki:', error);
        alert('Wyst�pi� b��d podczas �adowania p�ki.');
    }
}

async function addBookToWishlist() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        alert('Prosz� wype�ni� oba pola!');
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazw? u?ytkownika z localStorage

        if (!username) {
            alert('Musisz by� zalogowany, aby doda� ksi��k� na list� �ycze�.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Sprawd�, czy ksi��ka ju� istnieje w bazie danych
        const existingBooksResponse = await fetch('http://localhost:3000/api/books');
        if (!existingBooksResponse.ok) {
            alert('B��d podczas sprawdzania istniej�cych ksi��ek.');
            return;
        }

        const existingBooks = await existingBooksResponse.json();
        const existingBook = existingBooks.find(book => book.title === title && book.author === author);

        let bookId;

        if (existingBook) {
            // Je�li ksi��ka istnieje, u�yj jej ID
            bookId = existingBook._id;
        } else {
            // Je?li ksi��ka nie istnieje, dodaj j� do bazy danych
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author }),
            });

            if (!response.ok) {
                alert('B��d podczas dodawania ksi��ki.');
                return;
            }

            const newBook = await response.json();
            if (!newBook || !newBook._id) {
                alert('Serwer nie zwr�ci� ID nowej ksi��ki.');
                return;
            }

            bookId = newBook._id; // Ustaw `bookId` na warto�� zwr�con� przez serwer
        }

        // Dodaj ksi��k� na p�k� u�ytkownika
        const shelfResponse = await fetch('http://localhost:3000/api/user-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (shelfResponse.ok) {
            alert('Ksi��ka zosta�a pomy�lnie dodana na list� �ycze�!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            displayWishlist();
            fetchBooks();
        } else {
            alert('B��d podczas dodawania ksi��ki na list� �ycze�.');
        }
    } catch (error) {
        console.error('Wyst�pi� b��d:', error);
        alert('Wyst�pi� b��d podczas komunikacji z serwerem.');
    }
}

async function displayWishlist() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz by� zalogowany, aby zobaczy� swoj� list� �ycze�.');
        return;
    }

    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz ksi��ki u�ytkownika
        const response = await fetch(`http://localhost:3000/api/user-wishlist/${userId}`);
        const userWishlist = await response.json();

        // Pobierz kontener listy
        const wishlist = document.getElementById('wishlist');
        wishlist.innerHTML = ''; // Wyczy�� list�

        // Wy?wietl ksi��ki na li�cie
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
                <button onclick="removeBookFromWishlist('${bookId._id}')">Usu�</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            wishlist.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B��d podczas �adowania p�ki:', error);
        alert('Wyst?pi? b??d podczas ?adowania p�?ki.');
    }
}

async function removeBookFromShelf(bookId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz by� zalogowany, aby usun�� ksi��k�.');
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
            alert('Ksi��ka zosta�a usuni�ta z p�ki!');
            displayShelf();
        } else {
            alert('B��d podczas usuwania ksi��ki.');
        }
    } catch (error) {
        console.error('B��d:', error);
        alert('Wystapil b��d podczas komunikacji z serwerem.');
    }
}

async function removeBookFromWishlist(bookId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz by� zalogowany, aby usun�� ksi��k�.');
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
            alert('Ksi��ka zosta�a usuni�ta z listy �ycze�!');
            displayWishlist();
        } else {
            alert('B��d podczas usuwania ksi��ki.');
        }
    } catch (error) {
        console.error('B��d:', error);
        alert('Wystapi� b��d podczas komunikacji z serwerem.');
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}






// Aktualizacja co sekund�
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

let allBooks = []; // Bufor na ksi��ki pobrane z serwera

// Pobierz ksi��ki z bazy danych przy za�adowaniu strony
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

// Wy�wietl podpowiedzi na podstawie wpisywanego tekstu
function showSuggestions(field) {
    const input = document.getElementById(`book${capitalize(field)}`);
    const suggestionsDiv = document.getElementById(`${field}Suggestions`);
    const query = input.value.toLowerCase();

    // Wyczy�� istniej�ce podpowiedzi
    suggestionsDiv.innerHTML = '';

    if (!query) return; // Brak tekstu -> brak podpowiedzi

    // Filtruj ksi��ki na podstawie wpisywanego tekstu
    const suggestions = allBooks
        .filter(book => book[field].toLowerCase().includes(query))
        .slice(0, 5); // Maksymalnie 5 podpowiedzi

    // Dodaj podpowiedzi do kontenera
    suggestions.forEach(book => {
        const suggestion = document.createElement('div');
        suggestion.textContent = book[field];
        suggestion.onclick = () => {
            input.value = book[field]; // Ustaw warto�� pola na wybran� podpowied�
            suggestionsDiv.innerHTML = ''; // Wyczy�� podpowiedzi
        };
        suggestionsDiv.appendChild(suggestion);
    });
}

// Pomocnicza funkcja do formatowania nazw p�l
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Wywo?anie fetchBooks przy za�adowaniu strony
document.addEventListener('DOMContentLoaded', fetchBooks);


