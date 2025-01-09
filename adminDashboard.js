// Pobranie nazwy u�ytkownika z lokalnego przechowywania
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
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong><br><small>W�a�ciciel: ${username}</small>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong><br> <span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Stan:</strong> ${bookId.condition || 'Nieznany'}</p>
                <p><strong>Ok�adka:</strong> ${bookId.coverType || 'Nieznana'}</p>
                <button onclick="removeBookFromShelf('${bookId._id}')">Usu�</button>
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



async function displayUsers() {
    try {
        const loggedInUsername = localStorage.getItem('username');

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

        // Filtruj u�ytkownik�w, aby nie pokazywa� zalogowanego u�ytkownika
        const otherUsers = users.filter(user => user._id !== loggedInUserId);

        // Pobierz kontener na u�ytkownik�w
        const usersContainer = document.getElementById('users');
        usersContainer.innerHTML = ''; // Wyczy�� kontener

        // Wy�wietl u�ytkownik�w w kartach
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
                <button onclick="removeUser('${user.username}')">Usu� u�ytkownika</button>
            `;

            userDiv.appendChild(userFront);
            userDiv.appendChild(userBack);
            userContainer.appendChild(userDiv);
            usersContainer.appendChild(userContainer);
        });
    } catch (error) {
        console.error('B��d podczas �adowania u�ytkownik�w:', error);
        alert('Wyst�pi� b��d podczas �adowania u�ytkownik�w.');
    }
}


async function removeBookFromShelf(bookId, targetUsername) {
    try {
        // Pobierz dane u�ytkownika na podstawie przekazanego targetUsername
        const userResponse = await fetch(`http://localhost:3000/api/users/${targetUsername}`);
        if (!userResponse.ok) {
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }
        const userData = await userResponse.json();
        const userId = userData.userId;

        // Wy�lij ��danie usuni�cia ksi��ki
        const response = await fetch('http://localhost:3000/api/user-books', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, bookId }),
        });

        if (response.ok) {
            alert(`Ksi��ka zosta�a usuni�ta z p�ki u�ytkownika ${targetUsername}!`);
            displayBooks(); // Od�wie� p�k�
        } else {
            alert('B��d podczas usuwania ksi��ki.');
        }
    } catch (error) {
        console.error('B��d:', error);
        alert('Wyst�pi� b��d podczas komunikacji z serwerem.');
    }
}

async function removeUser(username) {
    try {
        // Pobierz dane u�ytkownika na podstawie przekazanego username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }
        const userData = await userResponse.json();
        const userId = userData.userId;

        // Wy�lij ��danie usuni�cia u�ytkownika (teraz przekazujemy userId w URL)
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert(`U�ytkownik ${username} zosta� usuni�ty!`);
            displayUsers(); // Od�wie� p�k� (lub inne dane)
            displayBooks();
        } else {
            alert('B��d podczas usuwania u�ytkownika.');
        }
    } catch (error) {
        console.error('B��d:', error);
        alert('Wyst�pi� b��d podczas komunikacji z serwerem.');
    }
}



// Aktualizacja co sekund�
setInterval(updateDateTime, 1000);

window.onload = () => {
    displayBooks();
    displayUsers();
    updateDateTime();
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



