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

/*// Funkcja do wyœwietlania ksi¹¿ek na stronie
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
*/
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
    updateDateTime();
};


// Funkcja wylogowania (jeœli potrzebna w przysz³oœci)
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
