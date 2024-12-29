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
        // Pobierz wszystkich uøytkownikÛw
        const usersResponse = await fetch(`http://localhost:3000/api/users`);
        if (!usersResponse.ok) {
            alert('Nie moøna pobraÊ listy uøytkownikÛw.');
            return;
        }

        const users = await usersResponse.json();
        const userIds = users.map(user => user._id);

        // Pobierz ksiπøki wszystkich uøytkownikÛw
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






// Aktualizacja co sekundÍ
setInterval(updateDateTime, 1000);



window.onload = () => {
    displayBooks();
    updateDateTime();
};


// Funkcja wylogowania (jeúli potrzebna w przysz≥oúci)
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
