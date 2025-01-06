// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

if (!userId || userId === 'null') {
    console.error('userId is missing or invalid.');
    // Mo¿esz przekierowaæ u¿ytkownika lub poinformowaæ go o problemie
}


// Wyœwietlenie nazwy u¿ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeœli brak nazwy, wraca do logowania
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}

async function displayBooks() {
    try {
        const loggedInUsername = localStorage.getItem('username');
        if (!loggedInUsername) {
            alert('Musisz byæ zalogowany, aby zobaczyæ pó³kê.');
            return;
        }

        // Pobierz zalogowanego u¿ytkownika
        const loggedInUserResponse = await fetch(`http://localhost:3000/api/users/${loggedInUsername}`);
        if (!loggedInUserResponse.ok) {
            alert('Nie mo¿na znaleŸæ zalogowanego u¿ytkownika.');
            return;
        }
        const loggedInUserData = await loggedInUserResponse.json();
        const loggedInUserId = loggedInUserData.userId;

        // Pobierz wszystkich u¿ytkowników
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie mo¿na pobraæ listy u¿ytkowników.');
            return;
        }

        const users = await usersResponse.json();
        const userIds = users.map(user => user._id).filter(userId => userId !== loggedInUserId);

        // Pobierz ksi¹¿ki wszystkich u¿ytkowników z wyj¹tkiem zalogowanego
        const booksPromises = userIds.map(userId =>
            fetch(`http://localhost:3000/api/user-books/${userId}`)
        );

        const booksResponses = await Promise.all(booksPromises);
        const allBooks = (await Promise.all(
            booksResponses.map(response => response.json())
        )).flat();

        // Pobierz kontener pó³ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczyœæ pó³kê

        // Wyœwietl ksi¹¿ki na pó³ce
        allBooks.forEach(({ bookId, userId }) => {
            const user = users.find(u => u._id === userId); // ZnajdŸ w³aœciciela ksi¹¿ki
            const username = user ? user.username : 'Nieznany';

            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong><br><small>W³aœciciel: ${username}</small>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> ${bookId.author}</p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
                <button onclick="trade('${bookId._id}', '${userId}')">Wymiana</button>
                <button onclick="showUser('${userId}')">Wiêcej</button>
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

async function displaySuggestions() {
    try {
        const loggedInUsername = localStorage.getItem('username');
        if (!loggedInUsername) {
            alert('Musisz byæ zalogowany, aby zobaczyæ pó³kê.');
            return;
        }

        // Pobierz zalogowanego u¿ytkownika
        const loggedInUserResponse = await fetch(`http://localhost:3000/api/users/${loggedInUsername}`);
        if (!loggedInUserResponse.ok) {
            alert('Nie mo¿na znaleŸæ zalogowanego u¿ytkownika.');
            return;
        }
        const loggedInUserData = await loggedInUserResponse.json();
        const loggedInUserId = loggedInUserData.userId;

        // Pobierz wszystkich u¿ytkowników
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie mo¿na pobraæ listy u¿ytkowników.');
            return;
        }

        const users = await usersResponse.json();
        const userIds = users.map(user => user._id).filter(userId => userId !== loggedInUserId);

        // Pobierz ksi¹¿ki wszystkich u¿ytkowników z wyj¹tkiem zalogowanego
        const booksPromises = userIds.map(userId =>
            fetch(`http://localhost:3000/api/user-books/${userId}`)
        );

        const booksResponses = await Promise.all(booksPromises);
        const allBooks = (await Promise.all(
            booksResponses.map(response => response.json())
        )).flat();

        // Pobierz listê ¿yczeñ zalogowanego u¿ytkownika
        const wishlistResponse = await fetch(`http://localhost:3000/api/user-wishlist/${loggedInUserId}`);
        if (!wishlistResponse.ok) {
            alert('Nie mo¿na pobraæ listy ¿yczeñ.');
            return;
        }
        const wishlist = await wishlistResponse.json();

        // Filtruj ksi¹¿ki zgodnie z list¹ ¿yczeñ
        const matchingBooks = allBooks.filter(({ bookId }) =>
            wishlist.some(wish => wish.bookId.title === bookId.title && wish.bookId.author === bookId.author)
        );

        // Pobierz kontener sugestii
        const suggestions = document.getElementById('suggestions');
        suggestions.innerHTML = ''; // Wyczyœæ kontener sugestii

        // Wyœwietl ksi¹¿ki w sekcji sugestii
        matchingBooks.forEach(({ bookId, userId }) => {
            const user = users.find(u => u._id === userId); // ZnajdŸ w³aœciciela ksi¹¿ki
            const username = user ? user.username : 'Nieznany';

            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong><br><small>Autor: ${bookId.author}</small>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
                <button onclick="trade('${bookId._id}', '${userId}')">Wymiana</button>
                <button onclick="showUser('${userId, username}')">Wiêcej</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            suggestions.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B³¹d podczas ³adowania sugestii:', error);
        alert('Wyst¹pi³ b³¹d podczas ³adowania sugestii.');
    }
}






// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);



window.onload = () => {
    displayBooks();
    displaySuggestions();
    updateDateTime();
};


// Funkcja wylogowania (jeœli potrzebna w przysz³oœci)
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

function trade(bookId, userId) {
    localStorage.setItem('userId2', userId);
    localStorage.setItem('chosenBook', bookId);
    window.location.href = 'trade.html';
}

function showUser(userId, username) {
    localStorage.setItem('userId2', userId);
    window.location.href = 'userInformation.html';
}
