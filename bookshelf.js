// Pobranie nazwy u?ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wy?wietlenie nazwy u?ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Je?li brak nazwy, wraca do logowania
}

// Dodawanie nowej ksi??ki
async function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        alert('Prosz? wype?ni? oba pola!');
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazw? u?ytkownika z localStorage

        if (!username) {
            alert('Musisz by? zalogowany, aby doda? ksi??k? na pó?k?.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo?na znale?? u?ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Sprawd?, czy ksi??ka ju? istnieje w bazie danych
        const existingBooksResponse = await fetch('http://localhost:3000/api/books');
        if (!existingBooksResponse.ok) {
            alert('B??d podczas sprawdzania istniej?cych ksi??ek.');
            return;
        }

        const existingBooks = await existingBooksResponse.json();
        const existingBook = existingBooks.find(book => book.title === title && book.author === author);

        let bookId;

        if (existingBook) {
            // Je?li ksi??ka istnieje, u?yj jej ID
            bookId = existingBook._id;
        } else {
            // Je?li ksi??ka nie istnieje, dodaj j? do bazy danych
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author }),
            });

            if (!response.ok) {
                alert('B??d podczas dodawania ksi??ki.');
                return;
            }

            const newBook = await response.json();
            if (!newBook || !newBook._id) {
                alert('Serwer nie zwróci? ID nowej ksi??ki.');
                return;
            }

            bookId = newBook._id; // Ustaw `bookId` na warto?? zwrócon? przez serwer
        }

        // Dodaj ksi??k? na pó?k? u?ytkownika
        const shelfResponse = await fetch('http://localhost:3000/api/user-books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (shelfResponse.ok) {
            alert('Ksi??ka zosta?a pomy?lnie dodana na pó?k?!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            displayShelf(); // Od?wie? pó?k?
            fetchBooks();
        } else {
            alert('B??d podczas dodawania ksi??ki na pó?k?.');
        }
    } catch (error) {
        console.error('Wyst?pi? b??d:', error);
        alert('Wyst?pi? b??d podczas komunikacji z serwerem.');
    }
}


async function displayShelf() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz by? zalogowany, aby zobaczy? swoj? pó?k?.');
        return;
    }

    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo?na znale?? u?ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz ksi??ki u?ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId}`);
        const userBooks = await response.json();

        // Pobierz kontener pó?ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczy?? pó?k?

        // Wy?wietl ksi??ki na pó?ce
        userBooks.forEach(({ bookId }) => {
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book-on-shelf');
            bookDiv.innerHTML = `
                <div><strong>${bookId.title}</strong></div>
                <div>${bookId.author}</div>
                <button onclick="removeBookFromShelf('${bookId._id}')">Usu?</button>
            `;
            shelf.appendChild(bookDiv);
        });
    } catch (error) {
        console.error('B??d podczas ?adowania pó?ki:', error);
        alert('Wyst?pi? b??d podczas ?adowania pó?ki.');
    }
}


async function removeBookFromShelf(bookId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Musisz by? zalogowany, aby usun?? ksi??k?.');
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
            alert('Ksi??ka zosta?a usuni?ta z pó?ki!');
            displayShelf();
        } else {
            alert('B??d podczas usuwania ksi??ki.');
        }
    } catch (error) {
        console.error('Bladd:', error);
        alert('Wystapil bladd podczas komunikacji z serwerem.');
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
        alert('Wyst¹pi³ b³¹d podczas komunikacji z serwerem.');
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}

async function addBookToWishlist() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        alert('Proszê wype³niæ oba pola!');
        return;
    }

    try {
        const username = localStorage.getItem('username'); // Pobierz nazwê u¿ytkownika z localStorage

        if (!username) {
            alert('Musisz byæ zalogowany, aby dodaæ ksi¹¿kê do listy ¿yczeñ.');
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

        // Dodaj ksi¹¿kê do listy ¿yczeñ u¿ytkownika
        const wishlistResponse = await fetch('http://localhost:3000/api/user-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, title, author }),
        });

        if (wishlistResponse.ok) {
            alert('Ksi¹¿ka zosta³a dodana do listy ¿yczeñ!');
            document.getElementById('wishlistBookTitle').value = '';
            document.getElementById('wishlistBookAuthor').value = '';
            displayWishlist(); // Odœwie¿ listê ¿yczeñ

        } else {
            alert('B³¹d podczas dodawania ksi¹¿ki do listy ¿yczeñ.');
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

        // Pobierz ksi¹¿ki z listy ¿yczeñ u¿ytkownika
        const wishlistResponse = await fetch(`http://localhost:3000/api/user-wishlist/${userId}`);
        const wishlist = await wishlistResponse.json();

        // Pobierz kontener listy ¿yczeñ
        const wishlistDiv = document.getElementById('wishlist');
        wishlistDiv.innerHTML = ''; // Wyczyœæ listê ¿yczeñ

        // Wyœwietl ksi¹¿ki na liœcie ¿yczeñ
        wishlist.forEach(({ title, author, _id }) => {
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book-on-wishlist');
            bookDiv.innerHTML = `
                <div><strong>${title}</strong></div>
                <div>${author}</div>
                <button onclick="removeBookFromWishlist('${_id}')">Usuñ</button>
            `;
            wishlistDiv.appendChild(bookDiv);
        });
    } catch (error) {
        console.error('B³¹d podczas ³adowania listy ¿yczeñ:', error);
        alert('Wyst¹pi³ b³¹d podczas ³adowania listy ¿yczeñ.');
    }
}




// Aktualizacja co sekund?
setInterval(updateDateTime, 1000);


window.onload = () => {
    //displayBooks();
    displayShelf();
    displayWishlist();
    updateDateTime();
};


// Funkcja wylogowania (je?li potrzebna w przysz?o?ci)
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

let allBooks = []; // Bufor na ksi??ki pobrane z serwera

// Pobierz ksi??ki z bazy danych przy za?adowaniu strony
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

// Wy?wietl podpowiedzi na podstawie wpisywanego tekstu
function showSuggestions(field) {
    const input = document.getElementById(`book${capitalize(field)}`);
    const suggestionsDiv = document.getElementById(`${field}Suggestions`);
    const query = input.value.toLowerCase();

    // Wyczy?? istniej?ce podpowiedzi
    suggestionsDiv.innerHTML = '';

    if (!query) return; // Brak tekstu -> brak podpowiedzi

    // Filtruj ksi??ki na podstawie wpisywanego tekstu
    const suggestions = allBooks
        .filter(book => book[field].toLowerCase().includes(query))
        .slice(0, 5); // Maksymalnie 5 podpowiedzi

    // Dodaj podpowiedzi do kontenera
    suggestions.forEach(book => {
        const suggestion = document.createElement('div');
        suggestion.textContent = book[field];
        suggestion.onclick = () => {
            input.value = book[field]; // Ustaw warto?? pola na wybran? podpowied?
            suggestionsDiv.innerHTML = ''; // Wyczy?? podpowiedzi
        };
        suggestionsDiv.appendChild(suggestion);
    });
}

// Pomocnicza funkcja do formatowania nazw pól
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Wywo?anie fetchBooks przy za?adowaniu strony
document.addEventListener('DOMContentLoaded', fetchBooks);


