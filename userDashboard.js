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

async function displayNotification() {
    try {

        const username = localStorage.getItem('username'); // Pobierz nazwê u¿ytkownika z localStorage

        if (!username) {
            alert('Musisz byæ zalogowany, aby dodaæ ksi¹¿kê na pó³kê.');
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
        if (!userId) {
            alert('Musisz byæ zalogowany, aby wyœwietliæ powiadomienia.');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/trades/${userId}`);
        if (!response.ok) {
            throw new Error('Nie uda³o siê pobraæ powiadomieñ.');
        }

        const trades = await response.json();
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = ''; // Wyczyœæ powiadomienia

        if (trades.length === 0) {
            notificationList.innerHTML = '<li>Brak nowych powiadomieñ.</li>';
            return;
        }
        console.log('Otrzymane dane wymiany:', trades);
        trades.forEach(trade => {
            const notification = document.createElement('li');
            const user1 = trade.userId.username || 'Nieznany u¿ytkownik'; // Dodaj obs³ugê braku danych
            const user2 = trade.userId2.username || 'Nieznany u¿ytkownik';

            const proposedBooks = trade.selectedBooks1.map(book => `${book.bookId.title} by ${book.bookId.author}`).join(', ');
            const requestedBooks = trade.selectedBooks2.map(book => `${book.bookId.title} by ${book.bookId.author}`).join(', ');


            console.log('Proponowane ksi¹¿ki:', proposedBooks);
            console.log('¯¹dane ksi¹¿ki:', requestedBooks);
            notification.innerHTML = `
                <p><strong>${user1}</strong> zaproponowa³ Ci wymianê ksi¹¿ek:</p>
                <p><strong>Proponuje:</strong> ${proposedBooks}</p>
                <p><strong>Chce:</strong> ${requestedBooks}</p>
                <div class="notification-buttons">
                    <button onclick="acceptTrade('${trade._id}')">Akceptuj</button>
                    <button onclick="rejectTrade('${trade._id}')">Odrzuæ</button>
                    <button onclick="counterOffer('${trade._id}')">Kontroferta</button>
                </div>
            `;

            notificationList.appendChild(notification);
        });
        
        

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
