// Pobranie nazwy użytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeśli brak nazwy, wraca do logowania
}
function logout() {
    window.location.href = "index.html";
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
        const loggedInUsername = username;

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
                <button onclick="removeBookFromShelf('${bookId._id}')">Usuń</button>
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



async function displayUsers() {
    try {
        const loggedInUsername = localStorage.getItem('username');

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

        // Filtruj użytkowników, aby nie pokazywać zalogowanego użytkownika
        const otherUsers = users.filter(user => user._id !== loggedInUserId);

        // Pobierz kontener na użytkowników
        const usersContainer = document.getElementById('users');
        usersContainer.innerHTML = ''; // Wyczyść kontener

        // Wyświetl użytkowników w kartach
        otherUsers.forEach(user => {
            const userContainer = document.createElement('div');
            userContainer.classList.add('users'); // Styl jak "book-container"

            const userDiv = document.createElement('div');
            userDiv.classList.add('book'); // Styl jak "book"

            const userFront = document.createElement('div');
            userFront.classList.add('book-face', 'book-front'); // Styl jak "book-face" i "book-front"
            userFront.innerHTML = `<strong title="${user.username}">${user.username}</strong>`;

            const userBack = document.createElement('div');
            userBack.classList.add('book-face', 'book-back'); // Styl jak "book-face" i "book-back"
            userBack.innerHTML = `
                <p><strong>Login:</strong>  <span title="${user.username}">${user.username}</span></p>
                <button onclick="removeUser('${user.username}')">Usuń użytkownika</button>
            `;

            userDiv.appendChild(userFront);
            userDiv.appendChild(userBack);
            userContainer.appendChild(userDiv);
            usersContainer.appendChild(userContainer);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania użytkowników:', error);
        alert('Wystąpił błąd podczas ładowania użytkowników.');
    }
}


async function removeBookFromShelf(bookId, targetUsername) {
    try {
        // Pobierz dane użytkownika na podstawie przekazanego targetUsername
        const userResponse = await fetch(`http://localhost:3000/api/users/${targetUsername}`);
        if (!userResponse.ok) {
            alert('Nie można znaleźć użytkownika.');
            return;
        }
        const userData = await userResponse.json();
        const userId = userData.userId;

        // Wyślij żądanie usunięcia książki
        const response = await fetch('http://localhost:3000/api/user-books', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (response.ok) {
            alert(`Książka została usunięta z półki użytkownika ${targetUsername}!`);
            displayBooks(); // Odśwież półkę
        } else {
            alert('Błąd podczas usuwania książki.');
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas komunikacji z serwerem.');
    }
}

async function removeUser(username) {
    try {
        // Pobierz dane użytkownika na podstawie przekazanego username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie można znaleźć użytkownika.');
            return;
        }
        const userData = await userResponse.json();
        const userId = userData.userId;

        // Wyślij żądanie usunięcia użytkownika (teraz przekazujemy userId w URL)
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert(`Użytkownik ${username} został usunięty!`);
            displayUsers(); // Odśwież półkę (lub inne dane)
            displayBooks();
        } else {
            alert('Błąd podczas usuwania użytkownika.');
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas komunikacji z serwerem.');
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


// Aktualizacja co sekundę
setInterval(updateDateTime, 1000);

window.onload = () => {
    displayBooks();
    displayUsers();
    updateDateTime();
    searchBooks();
};

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
    const shelf = document.getElementById('users');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});



