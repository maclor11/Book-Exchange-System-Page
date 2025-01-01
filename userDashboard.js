// Pobranie nazwy u�ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wy�wietlenie nazwy u�ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Je�li brak nazwy, wraca do logowania
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
            throw new Error('Nie uda�o si� pobra� nazwy u�ytkownika.');
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
            alert('Musisz by� zalogowany, aby zobaczy� p�k�.');
            return;
        }

        // Pobierz zalogowanego u�ytkownika
        const loggedInUserResponse = await fetch(`http://localhost:3000/api/users/${loggedInUsername}`);
        if (!loggedInUserResponse.ok) {
            alert('Nie mo�na znale�� zalogowanego u�ytkownika.');
            return;
        }
        const loggedInUserData = await loggedInUserResponse.json();
        const loggedInUserId = loggedInUserData.userId;

        // Pobierz wszystkich u�ytkownik�w
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie mo�na pobra� listy u�ytkownik�w.');
            return;
        }

        const users = await usersResponse.json();
        const userIds = users.map(user => user._id).filter(userId => userId !== loggedInUserId);

        // Pobierz ksi��ki wszystkich u�ytkownik�w z wyj�tkiem zalogowanego
        const booksPromises = userIds.map(userId =>
            fetch(`http://localhost:3000/api/user-books/${userId}`)
        );

        const booksResponses = await Promise.all(booksPromises);
        const allBooks = (await Promise.all(
            booksResponses.map(response => response.json())
        )).flat();

        // Pobierz kontener p�ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczy�� p�k�

        // Wy�wietl ksi��ki na p�ce
        allBooks.forEach(({ bookId, userId }) => {
            const user = users.find(u => u._id === userId); // Znajd� w�a�ciciela ksi��ki
            const username = user ? user.username : 'Nieznany';

            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong><br><small>W�a�ciciel: ${username}</small>`;

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
        console.error('B��d podczas �adowania p�ki:', error);
        alert('Wyst�pi� b��d podczas �adowania p�ki.');
    }
}

async function displaySuggestions() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Musisz by� zalogowany, aby zobaczy� sugestie.');
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

        // Pobierz list� �ycze� zalogowanego u�ytkownika
        const wishlistResponse = await fetch(`http://localhost:3000/api/user-wishlist/${userId}`);
        if (!wishlistResponse.ok) {
            alert('Nie mo�na pobra� listy �ycze�.');
            return;
        }

        const wishlist = await wishlistResponse.json();

        // Pobierz wszystkie ksi��ki z p�ki
        const booksResponse = await fetch(`http://localhost:3000/api/user-books`);
        if (!booksResponse.ok) {
            alert('Nie mo�na pobra� listy ksi��ek.');
            return;
        }

        const allBooks = await booksResponse.json();

        // Znajd� ksi��ki, kt�re mog� si� spodoba�
        const matchingBooks = allBooks.filter(({ bookId }) => {
            return wishlist.some(wish =>
                wish.bookId.title === bookId.title && wish.bookId.author === bookId.author
            );
        });

        // Pobierz kontener sugestii
        const suggestions = document.getElementById('suggestions');
        suggestions.innerHTML = ''; // Wyczy�� kontener sugestii

        // Wy�wietl ksi��ki w sekcji sugestii
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
        console.error('B��d podczas �adowania sugestii:', error);
        alert('Wyst�pi� b��d podczas �adowania sugestii.');
    }
}





// Aktualizacja co sekund�
setInterval(updateDateTime, 1000);



window.onload = () => {
    displayBooks();
    displaySuggestions();
    updateDateTime();
};


// Funkcja wylogowania (je�li potrzebna w przysz�o�ci)
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
