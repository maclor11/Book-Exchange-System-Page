// Pobranie nazwy u�ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wy�wietlenie nazwy u�ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Je�li brak nazwy, wraca do logowania
}

// Funkcja przej�cia do konta u�ytkownika
function goToAccount() {
    
}

// Funkcja do wy�wietlania ksi��ek na stronie
async function displayBooks() {
    try {
        const response = await fetch('http://localhost:3000/api/books');
        const books = await response.json();

        // Pobierz kontener do wy�wietlania ksi��ek
        const bookWall = document.getElementById('bookWall');
        bookWall.innerHTML = ''; // Wyczy�� poprzednie ksi��ki

        // Dodaj ka�d� ksi��k� do kontenera
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');
            bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <button onclick="viewBookDetails('${book._id}')">Wi�cej</button>
            <button onclick="addBookToShelf('${book._id}')">Dodaj na p�k�</button>
`;
            bookWall.appendChild(bookCard);
        });
    } catch (error) {
        console.error('B��d podczas �adowania ksi��ek:', error);
        alert('Wyst�pi� b��d podczas pobierania ksi��ek.');
    }
}

// Funkcja wy�wietlania szczeg��w ksi��ki
function viewBookDetails(bookId) {
    alert(`Szczeg�y ksi��ki o ID: ${bookId}`);
    // W przysz�o�ci dodaj logik� przej�cia do strony szczeg��w ksi��ki
}

// Dodawanie nowej ksi��ki
async function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        alert('Prosz� wype�ni� oba pola!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author })
        });

        if (response.ok) {
            alert('Ksi��ka dodana pomy�lnie!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            displayBooks(); // Od�wie� list� ksi��ek
        } else {
            alert('B��d podczas dodawania ksi��ki.');
        }
    } catch (error) {
        console.error('Wyst�pi� b��d:', error);
        alert('Wyst�pi� b��d podczas komunikacji z serwerem.');
    }
}

async function addBookToShelf(bookId) {
    const username = localStorage.getItem('username'); // Pobierz nazw� u�ytkownika z localStorage

    if (!username) {
        alert('Musisz by� zalogowany, aby doda� ksi��k�.');
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

        // Dodaj ksi��k� na p�k� u�ytkownika
        const response = await fetch('http://localhost:3000/api/user-books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (response.ok) {
            alert('Ksi��ka zosta�a dodana na p�k�!');
        } else {
            alert('B��d podczas dodawania ksi��ki na p�k�.');
        }
    } catch (error) {
        console.error('B��d:', error);
        alert('Wyst�pi� b��d podczas komunikacji z serwerem.');
    }
}



// Funkcja wylogowania (je�li potrzebna w przysz�o�ci)
function logout() {
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Wywo�anie funkcji displayBooks po za�adowaniu strony
window.onload = displayBooks;
