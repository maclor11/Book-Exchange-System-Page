// Pobranie nazwy uøytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wyúwietlenie nazwy uøytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeúli brak nazwy, wraca do logowania
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}

async function getUsernameById(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/user/${userId}`);
        if (!response.ok) {
            throw new Error('Nie uda≥o siÍ pobraÊ nazwy uøytkownika.');
        }
        const data = await response.json();
        return data.username;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function displayBooks() {
    try {
        const loggedInUsername = localStorage.getItem('username');
        if (!loggedInUsername) {
            alert('Musisz byÊ zalogowany, aby zobaczyÊ pÛ≥kÍ.');
            return;
        }

        // Pobierz zalogowanego uøytkownika
        const loggedInUserResponse = await fetch(`http://localhost:3000/api/users/${loggedInUsername}`);
        if (!loggedInUserResponse.ok) {
            alert('Nie moøna znaleüÊ zalogowanego uøytkownika.');
            return;
        }
        const loggedInUserData = await loggedInUserResponse.json();
        const loggedInUserId = loggedInUserData.userId;

        // Pobierz wszystkich uøytkownikÛw
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie moøna pobraÊ listy uøytkownikÛw.');
            return;
        }

        const users = await usersResponse.json();
        const userIds = users.map(user => user._id).filter(userId => userId !== loggedInUserId);

        // Pobierz ksiπøki wszystkich uøytkownikÛw z wyjπtkiem zalogowanego
        const booksPromises = userIds.map(userId =>
            fetch(`http://localhost:3000/api/user-books/${userId}`)
        );

        const booksResponses = await Promise.all(booksPromises);
        const allBooks = (await Promise.all(
            booksResponses.map(response => response.json())
        )).flat();

        // Pobierz kontener pÛ≥ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // WyczyúÊ pÛ≥kÍ

        // Wyúwietl ksiπøki na pÛ≥ce
        allBooks.forEach(({ bookId, userId }) => {
            const user = users.find(u => u._id === userId); // Znajdü w≥aúciciela ksiπøki
            const username = user ? user.username : 'Nieznany';

            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong><br><small>W≥aúciciel: ${username}</small>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> ${bookId.author}</p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
                <button onclick="trade('${bookId._id}', '${userId}')">Wymiana</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            shelf.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B≥πd podczas ≥adowania pÛ≥ki:', error);
        alert('Wystπpi≥ b≥πd podczas ≥adowania pÛ≥ki.');
    }
}

async function displaySuggestions() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Musisz byÊ zalogowany, aby zobaczyÊ sugestie.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie moøna znaleüÊ uøytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz listÍ øyczeÒ zalogowanego uøytkownika
        const wishlistResponse = await fetch(`http://localhost:3000/api/user-wishlist/${userId}`);
        if (!wishlistResponse.ok) {
            alert('Nie moøna pobraÊ listy øyczeÒ.');
            return;
        }

        const wishlist = await wishlistResponse.json();

        // Pobierz wszystkie ksiπøki z pÛ≥ki
        const booksResponse = await fetch(`http://localhost:3000/api/user-books`);
        if (!booksResponse.ok) {
            alert('Nie moøna pobraÊ listy ksiπøek.');
            return;
        }

        const allBooks = await booksResponse.json();

        // Znajdü ksiπøki, ktÛre mogπ siÍ spodobaÊ
        const matchingBooks = allBooks.filter(({ bookId }) => {
            return wishlist.some(wish =>
                wish.bookId.title === bookId.title && wish.bookId.author === bookId.author
            );
        });

        // Pobierz kontener sugestii
        const suggestions = document.getElementById('suggestions');
        suggestions.innerHTML = ''; // WyczyúÊ kontener sugestii

        // Wyúwietl ksiπøki w sekcji sugestii
        matchingBooks.forEach(({ bookId, userId }) => {
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
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            suggestions.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B≥πd podczas ≥adowania sugestii:', error);
        alert('Wystπpi≥ b≥πd podczas ≥adowania sugestii.');
    }
}





// Aktualizacja co sekundÍ
setInterval(updateDateTime, 1000);



window.onload = () => {
    displayBooks();
    displaySuggestions();
    updateDateTime();
};


// Funkcja wylogowania (jeúli potrzebna w przysz≥oúci)
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
    window.location.href = 'trade.html';
}
