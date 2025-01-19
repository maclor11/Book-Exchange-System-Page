// Pobranie nazwy użytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');


// Wyświetlenie nazwy użytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeśli brak nazwy, wraca do logowania
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
            alert('Musisz być zalogowany, aby zobaczyć półkę.');
            return;
        }

        // Pobierz zalogowanego użytkownika
        const loggedInUserResponse = await fetch(`http://localhost:3000/api/users/${loggedInUsername}`);
        if (!loggedInUserResponse.ok) {
            alert('Nie można znaleźć zalogowanego użytkownika.');
            return;
        }
        const loggedInUserData = await loggedInUserResponse.json();
        const loggedInUserId = loggedInUserData.userId;

        // Pobierz wszystkich użytkowników
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie można pobrać listy użytkowników.');
            return;
        }

        const users = await usersResponse.json();
        const userIds = users.map(user => user._id).filter(userId => userId !== loggedInUserId);

        // Pobierz książki wszystkich użytkowników z wyjątkiem zalogowanego
        const booksPromises = userIds.map(userId =>
            fetch(`http://localhost:3000/api/user-books/${userId}`)
        );

        const booksResponses = await Promise.all(booksPromises);
        const allBooks = (await Promise.all(
            booksResponses.map(response => response.json())
        )).flat();

        // Pobierz kontener półki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczyść półkę

        // Wyświetl książki na półce
        allBooks.forEach(({ bookId, userId }) => {
            const user = users.find(u => u._id === userId); // Znajdź właściciela książki
            const username = user ? user.username : 'Nieznany';

            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong><br><small>Właściciel: ${username}</small>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong><br> <span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Stan:</strong> ${bookId.condition || 'Nieznany'}</p>
                <p><strong>Okładka:</strong> ${bookId.coverType || 'Nieznana'}</p>
                <button onclick="trade('${bookId._id}', '${userId}')">Wymiana</button>
                <button onclick="showUser('${userId}', '${username}')">Profil</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            shelf.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania półki:', error);
        alert('Wystąpił błąd podczas ładowania półki.');
    }
}

async function displaySuggestions() {
    try {
        const loggedInUsername = localStorage.getItem('username');
        if (!loggedInUsername) {
            alert('Musisz być zalogowany, aby zobaczyć półkę.');
            return;
        }

        // Pobierz zalogowanego użytkownika
        const loggedInUserResponse = await fetch(`http://localhost:3000/api/users/${loggedInUsername}`);
        if (!loggedInUserResponse.ok) {
            alert('Nie można znaleźć zalogowanego użytkownika.');
            return;
        }
        const loggedInUserData = await loggedInUserResponse.json();
        const loggedInUserId = loggedInUserData.userId;

        // Pobierz wszystkich użytkowników
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie można pobrać listy użytkowników.');
            return;
        }

        const users = await usersResponse.json();
        const userIds = users.map(user => user._id).filter(userId => userId !== loggedInUserId);

        // Pobierz książki wszystkich użytkowników z wyjątkiem zalogowanego
        const booksPromises = userIds.map(userId =>
            fetch(`http://localhost:3000/api/user-books/${userId}`)
        );

        const booksResponses = await Promise.all(booksPromises);
        const allBooks = (await Promise.all(
            booksResponses.map(response => response.json())
        )).flat();

        // Pobierz listę życzeń zalogowanego użytkownika
        const wishlistResponse = await fetch(`http://localhost:3000/api/user-wishlist/${loggedInUserId}`);
        if (!wishlistResponse.ok) {
            alert('Nie można pobrać listy życzeń.');
            return;
        }
        const wishlist = await wishlistResponse.json();

        // Filtruj książki zgodnie z listą życzeń
        const matchingBooks = allBooks.filter(({ bookId }) =>
            wishlist.some(wish => wish.bookId.title === bookId.title && wish.bookId.author === bookId.author)
        );

        // Pobierz kontener sugestii
        const suggestions = document.getElementById('suggestions');
        suggestions.innerHTML = ''; // Wyczyść kontener sugestii

        // Wyświetl książki w sekcji sugestii
        matchingBooks.forEach(({ bookId, userId }) => {
            const user = users.find(u => u._id === userId); // Znajdź właściciela książki
            const username = user ? user.username : 'Nieznany';

            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong><br><small>Właściciel: ${username}</small>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong><br> <span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Stan:</strong> ${bookId.condition || 'Nieznany'}</p>
                <p><strong>Okładka:</strong> ${bookId.coverType || 'Nieznana'}</p>
                <button onclick="trade('${bookId._id}', '${userId}')">Wymiana</button>
                <button onclick="showUser('${userId}', '${username}')">Profil</button>
            `;

            bookDiv.appendChild(bookFront);
            bookDiv.appendChild(bookBack);
            bookContainer.appendChild(bookDiv);
            suggestions.appendChild(bookContainer);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania sugestii:', error);
        alert('Wystąpił błąd podczas ładowania sugestii.');
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

        // Wymiany do oceny (review === 0 i status === 'completed')
        const tradesToReview = trades.filter(
            trade => trade.status === 'completed' && trade.reviewed === 0 && trade.userId._id === userId
        );

        const cancelledTrades = trades.filter(
            trade => trade.status === 'cancelled' && trade.userId._id === userId && trade.reviewed === 0
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

        // Powiadomienia o wymianach do oceny (review === 0 i status === 'completed')
        if (tradesToReview.length > 0) {
            tradesToReview.forEach(trade => {
                const user2 = trade.userId2.username || 'Nieznany użytkownik';

                const notification = document.createElement('li');

                notification.innerHTML = `
                <p><strong>${user2}</strong> zaakceptował Twoją wymianę książek</p>
                <div class="notification-buttons">
                <button onclick="leaveReview('${trade._id}', true)">Wystaw opinię</button>
                <button onclick="refresh('${trade._id}')">Nie wystawiaj opinii</button>
                </div>`;
                notificationList.appendChild(notification);
            });
        }

        if (cancelledTrades.length > 0) {
            cancelledTrades.forEach(trade => {
                const user2 = trade.userId2.username || 'Nieznany użytkownik';

                const notification = document.createElement('li');

                notification.innerHTML = `
                <p><strong>${user2}</strong> odrzucił Twoją wymianę książek</p>
                <div class="notification-buttons">
                <button onclick="deleteTrade('${trade._id}')">OK</button>
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
        if (filteredTrades.length === 0 && matchingBooks.length === 0 && tradesToReview.length === 0 && cancelledTrades.length === 0) {
            notificationList.innerHTML = '<li>Brak nowych powiadomień.</li>';
        }
    } catch (error) {
        console.error('Błąd podczas ładowania powiadomień:', error);
        alert('Wystąpił błąd podczas ładowania powiadomień.');
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const shelf = document.getElementById('shelf');
    const books = shelf.getElementsByClassName('book-container');

    Array.from(books).forEach(bookContainer => {
        const bookTitle = bookContainer.querySelector('.book-front strong').textContent.toLowerCase();
        if (bookTitle.includes(searchTerm)) {
            bookContainer.style.display = ''; // Pokaż, jeśli pasuje
        } else {
            bookContainer.style.display = 'none'; // Ukryj, jeśli nie pasuje
        }
    });
}


function leaveReview(tradeId) {
    localStorage.setItem('tradeId', tradeId);
    window.location.href = "secondOpinion.html";
}


// Aktualizacja co sekundę
setInterval(updateDateTime, 1000);

window.onload = () => {
    displayBooks();
    displaySuggestions();
    displayNotification();
    updateDateTime();
    searchBooks();
};

// Funkcja wylogowania (jeśli potrzebna w przyszłości)
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
    localStorage.setItem('username2', username);
    window.location.href = 'userInformation.html';
}

async function refresh(tradeId) {
    const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
    if (!response.ok) {
        throw new Error('Nie udało się pobrać powiadomień.');
    }

    const trades = await response.json();

    const response1 = await fetch(`http://localhost:3000/api/trades/${tradeId}/reviewed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: 1 })
    });

    if (response1.ok) {

        // Usuń animację wybuchu po 3 sekundach (zakładając długość filmu)
        setTimeout(() => {
            displayNotification(); // Odśwież powiadomienia
        }, 3000);
    } else {
        alert('Błąd odrzucania wymiany.');
    }

    // Odśwież dane na stronie
    // Możesz dodać np. przeładowanie strony lub zaktualizowanie widoku
    window.location.reload(); // Odświeżenie całej strony (alternatywnie: dynamiczne aktualizowanie UI)
}

async function acceptTrade(tradeId) {
    try {

        const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
        if (!response.ok) {
            throw new Error('Nie udało się pobrać powiadomień.');
        }

        const trades = await response.json();
        const userId = trades.userId;
        const userId2 = trades.userId2;
        const selectedBooks1 = trades.selectedBooks1;
        const selectedBooks2 = trades.selectedBooks2;



        const response1 = await fetch(`http://localhost:3000/api/trades/${tradeId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "completed" })
        });

        if (!response1.ok) {
            throw new Error('Nie udało się zaktualizować statusu wymiany.');
        }

        const deleteBooks1 = selectedBooks1.map(async (bookId) => {
            const response = await fetch(`http://localhost:3000/api/user-books/by-id/${bookId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.ok;
        });

        const deleteBooks2 = selectedBooks2.map(async (bookId) => {
            const response = await fetch(`http://localhost:3000/api/user-books/by-id/${bookId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.ok;
        });

        const results = await Promise.all([...deleteBooks1, ...deleteBooks2]);

        const allBooksDeleted = results.every(result => result);

        if (!allBooksDeleted) {
            alert('Wystąpił błąd przy usuwaniu książek.');
            return;
        }
        localStorage.setItem('tradeId', tradeId);

        // Usuń film po zakończeniu odtwarzania (ok. 3 sekundy w zależności od długości filmu)
        setTimeout(() => {}, 3000); // Zakładając, że film ma długość 3 sekundy

        //displayNotification();
        window.location.href = "opinion.html";
    } catch (error) {
        console.error('Błąd przy akceptowaniu wymiany:', error);
        alert('Wystąpił błąd przy akceptowaniu wymiany.');
    }
}

async function rejectTrade(tradeId) {
    try {
        const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
        if (!response.ok) {
            throw new Error('Nie udało się pobrać powiadomień.');
        }

        const trades = await response.json();

        const response1 = await fetch(`http://localhost:3000/api/trades/${tradeId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "cancelled" })
        });
        // Po otrzymaniu odpowiedzi z serwera
        if (response1.ok) {

            // Usuń animację wybuchu po 3 sekundach (zakładając długość filmu)
            setTimeout(() => {
                displayNotification(); // Odśwież powiadomienia
            }, 3000);
        } else {
            alert('Błąd odrzucania wymiany.');
        }
        // Odśwież dane na stronie
        // Możesz dodać np. przeładowanie strony lub zaktualizowanie widoku
        window.location.reload(); // Odświeżenie całej strony (alternatywnie: dynamiczne aktualizowanie UI)

    } catch (error) {
        console.error('Błąd przy odrzucaniu wymiany:', error);
        return { message: 'Błąd serwera', error: error.message };
    }
}

async function deleteTrade(tradeId) {
    try {

        // Wyœlij ¿¹danie usuniêcia wymiany
        const response = await fetch(`http://localhost:3000/api/trades/byid/${tradeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Po otrzymaniu odpowiedzi z serwera
        if (response.ok) {

            // Usuñ animacjê wybuchu po 3 sekundach (zak³adaj¹c d³ugosœæ filmu)
            setTimeout(() => {
                displayNotification(); // Odœwie¿ powiadomienia
            }, 3000);
        } else {
            alert('B³¹d odrzucania wymiany.');
        }

        // Odœwie¿ dane na stronie
        // Mo¿esz dodaæ np. prze³adowanie strony lub zaktualizowanie widoku
        window.location.reload(); // Odœwie¿enie ca³ej strony (alternatywnie: dynamiczne aktualizowanie UI)

    } catch (error) {
        console.error('B³¹d przy odrzucaniu wymiany:', error);
        return { message: 'B³¹d serwera', error: error.message };
    }
}


async function counterOffer(tradeId, userId) {
    alert(userId);
    localStorage.setItem('userId2', userId);
    // Wyślij żądanie usunięcia użytkownika (teraz przekazujemy userId w URL)
    const response = await fetch(`http://localhost:3000/api/trades/byid/${tradeId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    window.location.href = "kontroferta.html";
}

document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('shelf');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('suggestions');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});

