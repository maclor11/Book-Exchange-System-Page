// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');


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
            suggestions.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B³¹d podczas ³adowania sugestii:', error);
        alert('Wyst¹pi³ b³¹d podczas ³adowania sugestii.');
    }
}

async function displayNotification() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Musisz byæ zalogowany, aby wyœwietliæ powiadomienia.');
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

        // Pobierz wymiany
        const response = await fetch(`http://localhost:3000/api/trades/by-user/${userId}`);
        if (!response.ok) {
            throw new Error('Nie uda³o siê pobraæ powiadomieñ.');
        }

        const trades = await response.json();

        const filteredTrades = trades.filter(
            trade => trade.userId2._id === userId && trade.status === 'pending'
        );

        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = ''; // Wyczyœæ listê powiadomieñ

        if (filteredTrades.length === 0) {
            notificationList.innerHTML = '<li>Brak nowych powiadomieñ.</li>';
            return;
        }
        // Renderowanie powiadomieñ
        filteredTrades.forEach(trade => {
            const notification = document.createElement('li');
            const user1 = trade.userId.username || 'Nieznany u¿ytkownik';
            const user2 = trade.userId._id;
            // Przygotowanie danych ksi¹¿ek
            const proposedBooks = trade.selectedBooks1.map(book => `${book.bookId.title} - ${book.bookId.author}`).join('<br>');
            const requestedBooks = trade.selectedBooks2.map(book => `${book.bookId.title} - ${book.bookId.author}`).join('<br>');
            console.log('ksiazki1:', proposedBooks);
            console.log('ksiazki2:', requestedBooks);
            notification.innerHTML = `
            <p><strong>${user1}</strong> zaproponowa³ Ci wymianê ksi¹¿ek:</p>
            <p><strong>Proponuje:</strong><br>${proposedBooks}</p>
            <p><strong>Chce:</strong><br>${requestedBooks}</p>
            <div class="notification-buttons">
            <button onclick="acceptTrade('${trade._id}')">Akceptuj</button>
            <button onclick="rejectTrade('${trade._id}')">Odrzuæ</button>
            <button onclick="counterOffer('${trade._id}', '${user2}')">Kontroferta</button>
            </div>`;

            notificationList.appendChild(notification);
        });
        console.log(trade._id);

    } catch (error) {
        console.error('B³¹d podczas ³adowania powiadomieñ:', error);
        alert('Wyst¹pi³ b³¹d podczas ³adowania powiadomieñ.');
    }
}

// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);

window.onload = () => {
    displayBooks();
    displaySuggestions();
    displayNotification();
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

async function acceptTrade(tradeId) {
    try {
        const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
        if (!response.ok) {
            throw new Error('Nie uda³o siê pobraæ powiadomieñ.');
        }

        const trades = await response.json();
        const userId = trades.userId;
        const userId2 = trades.userId2;
        const selectedBooks1 = trades.selectedBooks1; // Ksi¹¿ki u¿ytkownika userId
        const selectedBooks2 = trades.selectedBooks2; // Ksi¹¿ki u¿ytkownika userId2


        // Usuñ ksi¹¿ki dla userId z selectedBooks1
        for (const bookId of selectedBooks1) {
            const response = await fetch(`http://localhost:3000/api/user-books/by-id/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Usuñ ksi¹¿ki dla userId2 z selectedBooks2
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

        console.log('Wymiana zakoñczona sukcesem');
        return { message: 'Wymiana zaakceptowana i zakoñczona', trade };
        displayNotification();
    } catch (error) {
        console.error('B³¹d przy akceptowaniu wymiany:', error);
        return { message: 'B³¹d serwera', error: error.message };
    }
}




async function rejectTrade(tradeId) {
    try {

        // Wyœlij ¿¹danie usuniêcia u¿ytkownika (teraz przekazujemy userId w URL)
        const response = await fetch(`http://localhost:3000/api/trades/byid/${tradeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Wymiana zosta³a odrzucona');
        return { message: 'Wymiana odrzucona i usuniêta' };
        if (response.ok) {
            alert(`Wymiana zosta³a odrzucona!`);
            displayNotification(); // Odœwie¿ pó³kê (lub inne dane)
        } else {
            alert('B³¹d odrzucania wymiany .');
        }
    } catch (error) {
        console.error('B³¹d przy odrzucaniu wymiany:', error);
        return { message: 'B³¹d serwera', error: error.message };
    }
}


async function counterOffer(tradeId, userId) {
    alert(userId);
    localStorage.setItem('userId2', userId);
    // Wyœlij ¿¹danie usuniêcia u¿ytkownika (teraz przekazujemy userId w URL)
    const response = await fetch(`http://localhost:3000/api/trades/byid/${tradeId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    window.location.href = "kontroferta.html";
}
