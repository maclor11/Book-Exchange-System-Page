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
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong><br>`;
            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong><br> <span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Stan:</strong> ${bookId.condition || 'Nieznany'}</p>
                <p><strong>Okładka:</strong> ${bookId.coverType || 'Nieznana'}</p>
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
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong><br>`;
            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
               <p><strong>Autor:</strong><br><span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Stan:</strong> ${bookId.condition || 'Nieznany'}</p>
                <p><strong>Okładka:</strong> ${bookId.coverType || 'Nieznana'}</p>
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

async function displayOpinions() {
    try {
        // Wysyłamy zapytanie GET do API, aby pobrać opinie użytkownika
        const response = await fetch(`http://localhost:3000/api/opinions/${userId2}`);

        // Sprawdzamy, czy zapytanie zakończyło się pomyślnie
        if (!response.ok) {
            throw new Error('Błąd podczas pobierania opinii');
        }

        // Odbieramy dane z odpowiedzi
        const opinions = await response.json();
        // Wybieramy element listy powiadomień
        const notificationList = document.getElementById("notificationList");

        // Jeżeli nie ma opinii, wyświetlamy komunikat
        if (opinions.length === 0) {
            const noOpinionsItem = document.createElement('li');
            noOpinionsItem.textContent = "Brak opinii o tym użytkowniku.";
            notificationList.appendChild(noOpinionsItem);
            return;
        }

        // Dla każdej opinii tworzona jest nowa pozycja na liście
        opinions.forEach(opinion => {
            const opinionItem = document.createElement('li');
            opinionItem.classList.add('notification-item');

            // Budowanie treści opinii
            opinionItem.innerHTML = `
                <div class="notification-details">
                    <strong>Ocena:</strong> ${opinion.stars} gwiazdek
                    <br>
                    <strong>Opinia:</strong> ${opinion.message}
                </div>
            `;

            // Dodajemy opinię do listy
            notificationList.appendChild(opinionItem);
        });
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas ładowania opinii.');
    }
}

async function getUsername2() {
    try {
        const response = await fetch(`http://localhost:3000/api/users/by-id/${userId2}`);

        // Sprawdzamy, czy zapytanie zakończyło się pomyślnie
        if (!response.ok) {
            throw new Error('Błąd podczas pobierania danych użytkownika');
        }

        const userResponse = await response.json();
        const username2 = userResponse.username;
        if (username2) {
            document.getElementById('username2').innerText = username2;
        } else {
            window.location.href = 'userDashboard.html'; // Jeœli brak nazwy, wraca do logowania
        }

    } catch (error) {
        console.error('Wystąpił problem:', error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getUsername2();
});


// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);

window.onload = () => {
    getUsername2();
    displayShelf();
    displayWishlist();
    displayOpinions();
    updateDateTime();
};
function dashboard() {
    window.location.href = 'userDashboard.html';
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
    const shelf = document.getElementById('wishlist');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});
