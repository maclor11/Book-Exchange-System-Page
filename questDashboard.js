function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
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
        const userIds = users.map(user => user._id).filter(userId => userId);

        // Pobierz ksiπøki wszystkich uøytkownikÛw z wyjπtkiem zalogowanego
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
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong><br><small>W≥aúciciel: ${username}</small>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> <br><span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Stan:</strong> ${bookId.condition || 'Nieznany'}</p>
                <p><strong>Ok≥adka:</strong> ${bookId.coverType || 'Nieznana'}</p>
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


function login() {
    window.location.href = 'index.html';
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



