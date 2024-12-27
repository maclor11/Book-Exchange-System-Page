// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wyœwietlenie nazwy u¿ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeœli brak nazwy, wraca do logowania
}

// Funkcja przejœcia do konta u¿ytkownika
function goToAccount() {
    
}

// Funkcja do wyœwietlania ksi¹¿ek na stronie
async function displayBooks() {
    try {
        const response = await fetch('http://localhost:3000/api/books');
        const books = await response.json();

        // Pobierz kontener do wyœwietlania ksi¹¿ek
        const bookWall = document.getElementById('bookWall');
        bookWall.innerHTML = ''; // Wyczyœæ poprzednie ksi¹¿ki

        // Dodaj ka¿d¹ ksi¹¿kê do kontenera
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');
            bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <button onclick="viewBookDetails('${book._id}')">Wiêcej</button>
            <button onclick="addBookToShelf('${book._id}')">Dodaj na pó³kê</button>
`;
            bookWall.appendChild(bookCard);
        });
    } catch (error) {
        console.error('B³¹d podczas ³adowania ksi¹¿ek:', error);
        alert('Wyst¹pi³ b³¹d podczas pobierania ksi¹¿ek.');
    }
}

// Funkcja wyœwietlania szczegó³ów ksi¹¿ki
function viewBookDetails(bookId) {
    alert(`Szczegó³y ksi¹¿ki o ID: ${bookId}`);
    // W przysz³oœci dodaj logikê przejœcia do strony szczegó³ów ksi¹¿ki
}

// Dodawanie nowej ksi¹¿ki
async function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    if (!title || !author) {
        alert('Proszê wype³niæ oba pola!');
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
            alert('Ksi¹¿ka dodana pomyœlnie!');
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            displayBooks(); // Odœwie¿ listê ksi¹¿ek
        } else {
            alert('B³¹d podczas dodawania ksi¹¿ki.');
        }
    } catch (error) {
        console.error('Wyst¹pi³ b³¹d:', error);
        alert('Wyst¹pi³ b³¹d podczas komunikacji z serwerem.');
    }
}

async function addBookToShelf(bookId) {
    const username = localStorage.getItem('username'); // Pobierz nazwê u¿ytkownika z localStorage

    if (!username) {
        alert('Musisz byæ zalogowany, aby dodaæ ksi¹¿kê.');
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

        // Dodaj ksi¹¿kê na pó³kê u¿ytkownika
        const response = await fetch('http://localhost:3000/api/user-books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (response.ok) {
            alert('Ksi¹¿ka zosta³a dodana na pó³kê!');
        } else {
            alert('B³¹d podczas dodawania ksi¹¿ki na pó³kê.');
        }
    } catch (error) {
        console.error('B³¹d:', error);
        alert('Wyst¹pi³ b³¹d podczas komunikacji z serwerem.');
    }
}



// Funkcja wylogowania (jeœli potrzebna w przysz³oœci)
function logout() {
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Wywo³anie funkcji displayBooks po za³adowaniu strony
window.onload = displayBooks;
