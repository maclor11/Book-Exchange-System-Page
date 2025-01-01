// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');
const userId2 = localStorage.getItem('userId2');
const chosenBook = localStorage.getItem('chosenBook');
function goBack() {
	window.location.href = 'userDashboard.html';
}

window.onload = () => {
    displayTradeBooks();
    displayShelf();
    updateDateTime();
};

async function displayShelf() {
    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo¿na znaleŸæ u¿ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz ksi¹¿ki u¿ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId}`);
        const userBooks = await response.json();

        // Pobierz kontener pó³ki
        const shelf = document.getElementById('shelf1');
        shelf.innerHTML = ''; // Wyczyœæ pó³kê

        // Wyœwietl ksi¹¿ki na pó³ce
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
                <button class="select-button">Wybierz</button>
            `;

            bookBack.querySelector('.select-button').addEventListener('click', (event) => {
                const button = event.target;
                const bookBack = button.closest('.book-back'); // Znalezienie rodzica .book-back
                const bookFront = bookBack.parentElement.querySelector('.book-front');

                if (button.textContent === 'Wybierz') {
                    button.textContent = 'Usuñ';
                    bookBack.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookBack.style.border = '1px solid #6d986e';
                    bookFront.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookFront.style.border = '1px solid #6d986e';
                } else {
                    button.textContent = 'Wybierz';
                    bookBack.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookBack.style.border = '1px solid #b0a890';
                    bookFront.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookFront.style.border = '1px solid #b0a890';
                }
            });

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

async function displayTradeBooks() {
    try {

        // Pobierz ksi¹¿ki u¿ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId2}`);
        const userBooks = await response.json();


        // Pobierz kontener pó³ki
        const shelf = document.getElementById('shelf2');
        shelf.innerHTML = ''; // Wyczyœæ pó³kê

        // Wyœwietl ksi¹¿ki na pó³ce
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
                <button class="select-button">Wybierz</button>
            `;

            if (bookId._id === chosenBook) {
                bookBack.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Zielony gradient
                bookBack.style.border = '1px solid #6d986e';
                bookFront.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Zielony gradient
                bookFront.style.border = '1px solid #6d986e';
                bookBack.querySelector('.select-button').textContent = 'Usuñ';
            }

            bookBack.querySelector('.select-button').addEventListener('click', (event) => {
                const button = event.target;
                const bookBack = button.closest('.book-back'); // Znalezienie rodzica .book-back
                const bookFront = bookBack.parentElement.querySelector('.book-front');

                if (button.textContent === 'Wybierz') {
                    button.textContent = 'Usuñ';
                    bookBack.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookBack.style.border = '1px solid #6d986e';
                    bookFront.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookFront.style.border = '1px solid #6d986e';
                } else {
                    button.textContent = 'Wybierz';
                    bookBack.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookBack.style.border = '1px solid #b0a890';
                    bookFront.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookFront.style.border = '1px solid #b0a890';
                }
            });

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
