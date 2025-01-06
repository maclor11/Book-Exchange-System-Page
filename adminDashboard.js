// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

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
        const loggedInUsername = localStorage.getItem('username');

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
                <button onclick="removeBookFromShelf('${bookId._id}', '${username}')">Usuñ</button>

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

async function removeBookFromShelf(bookId, targetUsername) {
    try {
        // Pobierz dane u¿ytkownika na podstawie przekazanego targetUsername
        const userResponse = await fetch(`http://localhost:3000/api/users/${targetUsername}`);
        if (!userResponse.ok) {
            alert('Nie mo¿na znaleŸæ u¿ytkownika.');
            return;
        }
        const userData = await userResponse.json();
        const userId = userData.userId;

        // Wyœlij ¿¹danie usuniêcia ksi¹¿ki
        const response = await fetch('http://localhost:3000/api/user-books', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (response.ok) {
            alert(`Ksi¹¿ka zosta³a usuniêta z pó³ki u¿ytkownika ${targetUsername}!`);
            displayBooks(); // Odœwie¿ pó³kê
        } else {
            alert('B³¹d podczas usuwania ksi¹¿ki.');
        }
    } catch (error) {
        console.error('B³¹d:', error);
        alert('Wyst¹pi³ b³¹d podczas komunikacji z serwerem.');
    }
}



// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);

window.onload = () => {
    displayBooks();
    updateDateTime();
};

