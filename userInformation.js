// Pobranie nazwy u�ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');
const userId2 = localStorage.getItem('userId2');

// Wy?wietlenie nazwy u�ytkownika lub przekierowanie do logowania
if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Je�li brak nazwy, wraca do logowania
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}

async function displayUsername2() {
    const userId2= localStorage.getItem('userId2'); // Pobierz nazw? u?ytkownika z localStorage

    if (!username) {
        alert('Musisz by� zalogowany, aby doda� ksi��k� na list� �ycze�.');
        return;
    }

    // Pobierz userId na podstawie username
    const userResponse = await fetch(`http://localhost:3000/api/users/${userId2}`);
    if (!userResponse.ok) {
        alert('Nie mo�na znale�� u�ytkownika.');
        return;
    }

    const userData = await userResponse.json();
    localStorage.setItem('username2',userData.username);


}

async function displayShelf() {
    try { 


        // Pobierz ksi��ki u?ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId2}`);
        const userBooks = await response.json();

        // Pobierz kontener p�ki
        const shelf = document.getElementById('shelf');
        shelf.innerHTML = ''; // Wyczy�� p�k�

        // Wy?wietl ksi??ki na p�?ce
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
        console.error('B��d podczas �adowania p�ki:', error);
        alert('Wyst�pi� b��d podczas �adowania p�ki.');
    }
}

async function displayWishlist() {
    try {
        // Pobierz ksi��ki u�ytkownika
        const response = await fetch(`http://localhost:3000/api/user-wishlist/${userId2}`);
        const userWishlist = await response.json();

        // Pobierz kontener listy
        const wishlist = document.getElementById('wishlist');
        wishlist.innerHTML = ''; // Wyczy�� list�

        // Wy?wietl ksi��ki na li�cie
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
        console.error('B��d podczas �adowania p�ki:', error);
        alert('Wyst�pi� b��d podczas �adowania p�ki.');
    }
}




// Aktualizacja co sekund�
setInterval(updateDateTime, 1000);


window.onload = () => {
    displayUsername2();
    displayShelf();
    displayWishlist();
    updateDateTime();
};


function dashboard() {
    window.location.href = 'userDashboard.html';
}






