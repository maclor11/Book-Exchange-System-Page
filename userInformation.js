const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');
const userId2 = localStorage.getItem('userId2');
// Wy?wietlenie nazwy u¿ytkownika lub przekierowanie do logowania


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
async function displayShelf() {
    try {
        // Pobierz ksi¹¿ki u?ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId2}`);
        const userBooks = await response.json();
        // Pobierz kontener pó³ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczyœæ pó³kê
        // Wy?wietl ksi??ki na pó?ce
        userBooks.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');
            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong>`;
            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> ${bookId.author}</p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
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
async function displayWishlist() {
    try {
        // Pobierz ksi¹¿ki u¿ytkownika
        const response = await fetch(`http://localhost:3000/api/user-wishlist/${userId2}`);
        const userWishlist = await response.json();
        // Pobierz kontener listy
        const wishlist = document.getElementById('wishlist');
        wishlist.innerHTML = ''; // Wyczyœæ listê
        // Wy?wietl ksi¹¿ki na liœcie
        userWishlist.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');
            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong>${bookId.title}</strong>`;
            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> ${bookId.author}</p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
            `;
            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            wishlist.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('B³¹d podczas ³adowania pó³ki:', error);
        alert('Wyst¹pi³ b³¹d podczas ³adowania pó³ki.');
    }
}

async function displayNotification() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Musisz być zalogowany, aby wyświetlić powiadomienia.');
            return;
        }

        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie można znaleźć użytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz wymiany
        const tradeResponse = await fetch(`http://localhost:3000/api/trades/by-user/${userId}`);
        if (!tradeResponse.ok) {
            throw new Error('Nie udało się pobrać powiadomień.');
        }

        const trades = await tradeResponse.json();
        const filteredTrades = trades.filter(
            trade => trade.userId2._id === userId && trade.status === 'pending'
        );

        // Pobierz listę życzeń użytkownika
        const wishlistResponse = await fetch(`http://localhost:3000/api/user-wishlist/${userId}`);
        if (!wishlistResponse.ok) {
            alert('Nie można pobrać listy życzeń.');
            return;
        }
        const wishlist = await wishlistResponse.json();

        // Pobierz wszystkich użytkowników (bez zalogowanego)
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie można pobrać listy użytkowników.');
            return;
        }
        const users = await usersResponse.json();
        const userIds = users.map(user => user._id).filter(id => id !== userId);

        // Pobierz książki wszystkich użytkowników z wyjątkiem zalogowanego
        const booksPromises = userIds.map(id =>
            fetch(`http://localhost:3000/api/user-books/${id}`)
        );

        const booksResponses = await Promise.all(booksPromises);
        const allBooks = (await Promise.all(
            booksResponses.map(response => response.json())
        )).flat();

        // Filtruj książki zgodnie z listą życzeń
        const matchingBooks = allBooks.filter(({ bookId }) =>
            wishlist.some(wish => wish.bookId.title === bookId.title && wish.bookId.author === bookId.author)
        );

        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = ''; // Wyczyść listę powiadomień

        // Powiadomienia o wymianach
        if (filteredTrades.length > 0) {
            filteredTrades.forEach(trade => {
                const notification = document.createElement('li');
                const user1 = trade.userId.username || 'Nieznany użytkownik';
                const user2 = trade.userId._id;

                const proposedBooks = trade.selectedBooks1.map(book => `${book.bookId.title} - ${book.bookId.author}`).join('<br>');
                const requestedBooks = trade.selectedBooks2.map(book => `${book.bookId.title} - ${book.bookId.author}`).join('<br>');

                notification.innerHTML = `
                <p><strong>${user1}</strong> zaproponował Ci wymianę książek:</p>
                <p><strong>Proponuje:</strong><br>${proposedBooks}</p>
                <p><strong>Chce:</strong><br>${requestedBooks}</p>
                <div class="notification-buttons">
                <button onclick="acceptTrade('${trade._id}')">Akceptuj</button>
                <button onclick="rejectTrade('${trade._id}')">Odrzuć</button>
                <button onclick="counterOffer('${trade._id}', '${user2}')">Kontroferta</button>
                </div>`;
                notificationList.appendChild(notification);
            });
        }

        // Powiadomienia o nowych książkach na półkach innych użytkowników
        if (matchingBooks.length > 0) {
            matchingBooks.forEach(({ bookId, userId }) => {
                const user = users.find(u => u._id === userId);
                const username = user ? user.username : 'Nieznany użytkownik';

                const notification = document.createElement('li');
                notification.innerHTML = `
                <p><strong>${username}</strong> ma książkę z Twojej listy życzeń:</p>
                <p><strong>${bookId.title}</strong> - ${bookId.author}</p>
                `;
                notificationList.appendChild(notification);
            });
        }

        // Jeśli brak powiadomień
        if (filteredTrades.length === 0 && matchingBooks.length === 0) {
            notificationList.innerHTML = '<li>Brak nowych powiadomień.</li>';
        }
    } catch (error) {
        console.error('Błąd podczas ładowania powiadomień:', error);
        alert('Wystąpił błąd podczas ładowania powiadomień.');
    }
}
// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);

window.onload = () => {
    displayShelf();
    displayWishlist();
    updateDateTime();
};
function dashboard() {
    window.location.href = 'userDashboard.html';
}