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

/*// Funkcja do wy�wietlania ksi��ek na stronie
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
*/
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
    updateDateTime();
};


// Funkcja wylogowania (je�li potrzebna w przysz�o�ci)
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
