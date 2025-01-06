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
                <button onclick="showUser('${userId}')">Wi�cej</button>
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

        // Pobierz list� �ycze� zalogowanego u�ytkownika
        const wishlistResponse = await fetch(`http://localhost:3000/api/user-wishlist/${loggedInUserId}`);
        if (!wishlistResponse.ok) {
            alert('Nie mo�na pobra� listy �ycze�.');
            return;
        }
        const wishlist = await wishlistResponse.json();

        // Filtruj ksi��ki zgodnie z list� �ycze�
        const matchingBooks = allBooks.filter(({ bookId }) =>
            wishlist.some(wish => wish.bookId.title === bookId.title && wish.bookId.author === bookId.author)
        );

        // Pobierz kontener sugestii
        const suggestions = document.getElementById('suggestions');
        suggestions.innerHTML = ''; // Wyczy�� kontener sugestii

        // Wy�wietl ksi��ki w sekcji sugestii
        matchingBooks.forEach(({ bookId, userId }) => {
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
                <button onclick="showUser('${userId}')">Wi�cej</button>
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

async function displayNotification() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Musisz by� zalogowany, aby wy�wietli� powiadomienia.');
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

        // Pobierz wymiany
        const response = await fetch(`http://localhost:3000/api/trades/by-user/${userId}`);
        if (!response.ok) {
            throw new Error('Nie uda�o si� pobra� powiadomie�.');
        }

        const trades = await response.json();

        const filteredTrades = trades.filter(
            trade => trade.userId2._id === userId && trade.status === 'pending'
        );

        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = ''; // Wyczy�� list� powiadomie�

        if (filteredTrades.length === 0) {
            notificationList.innerHTML = '<li>Brak nowych powiadomie�.</li>';
            return;
        }
        // Renderowanie powiadomie�
        filteredTrades.forEach(trade => {
            const notification = document.createElement('li');
            const user1 = trade.userId.username || 'Nieznany u�ytkownik';
            const user2 = trade.userId._id;
            // Przygotowanie danych ksi��ek
            const proposedBooks = trade.selectedBooks1.map(book => `${book.bookId.title} - ${book.bookId.author}`).join('<br>');
            const requestedBooks = trade.selectedBooks2.map(book => `${book.bookId.title} - ${book.bookId.author}`).join('<br>');
            console.log('ksiazki1:', proposedBooks);
            console.log('ksiazki2:', requestedBooks);
            notification.innerHTML = `
            <p><strong>${user1}</strong> zaproponowa� Ci wymian� ksi��ek:</p>
            <p><strong>Proponuje:</strong><br>${proposedBooks}</p>
            <p><strong>Chce:</strong><br>${requestedBooks}</p>
            <div class="notification-buttons">
            <button onclick="acceptTrade('${trade._id}')">Akceptuj</button>
            <button onclick="rejectTrade('${trade._id}')">Odrzu�</button>
            <button onclick="counterOffer('${trade._id}', '${user2}')">Kontroferta</button>
            </div>`;

            notificationList.appendChild(notification);
        });
        console.log(trade._id);

    } catch (error) {
        console.error('B��d podczas �adowania powiadomie�:', error);
        alert('Wyst�pi� b��d podczas �adowania powiadomie�.');
    }
}

// Aktualizacja co sekund�
setInterval(updateDateTime, 1000);

window.onload = () => {
    displayBooks();
    displaySuggestions();
    displayNotification();
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
    localStorage.setItem('chosenBook', bookId);
    window.location.href = 'trade.html';
}

function showUser(userId, username) {
    localStorage.setItem('userId2', userId);
    window.location.href = 'userInformation.html';
}

async function acceptTrade(tradeId) {
    try {
        const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
        if (!response.ok) {
            throw new Error('Nie uda�o si� pobra� powiadomie�.');
        }

        const trades = await response.json();
        const userId = trades.userId;
        const userId2 = trades.userId2;
        const selectedBooks1 = trades.selectedBooks1; // Ksi��ki u�ytkownika userId
        const selectedBooks2 = trades.selectedBooks2; // Ksi��ki u�ytkownika userId2


        // Usu� ksi��ki dla userId z selectedBooks1
        for (const bookId of selectedBooks1) {
            const response = await fetch(`http://localhost:3000/api/user-books/by-id/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Usu� ksi��ki dla userId2 z selectedBooks2
        for (const bookId of selectedBooks2) {
            const response = await fetch(`http://localhost:3000/api/user-books/by-id/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }


        const response1 = await fetch(`http://localhost:3000/api/trades/${tradeId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "completed" })
        });

        console.log('Wymiana zako�czona sukcesem');
        return { message: 'Wymiana zaakceptowana i zako�czona', trade };
        displayNotification();
    } catch (error) {
        console.error('B��d przy akceptowaniu wymiany:', error);
        return { message: 'B��d serwera', error: error.message };
    }
}




async function rejectTrade(tradeId) {
    try {

        // Wy�lij ��danie usuni�cia u�ytkownika (teraz przekazujemy userId w URL)
        const response = await fetch(`http://localhost:3000/api/trades/byid/${tradeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Wymiana zosta�a odrzucona');
        return { message: 'Wymiana odrzucona i usuni�ta' };
        if (response.ok) {
            alert(`Wymiana zosta�a odrzucona!`);
            displayNotification(); // Od�wie� p�k� (lub inne dane)
        } else {
            alert('B��d odrzucania wymiany .');
        }
    } catch (error) {
        console.error('B��d przy odrzucaniu wymiany:', error);
        return { message: 'B��d serwera', error: error.message };
    }
}


async function counterOffer(tradeId, userId) {
    alert(userId);
    localStorage.setItem('userId2', userId);
    // Wy�lij ��danie usuni�cia u�ytkownika (teraz przekazujemy userId w URL)
    const response = await fetch(`http://localhost:3000/api/trades/byid/${tradeId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    window.location.href = "kontroferta.html";
}
