// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');
const userId2 = localStorage.getItem('userId2');
const chosenBook = localStorage.getItem('chosenBook');
function goBack() {
    localStorage.removeItem('userId2');
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

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}

async function sendTradeOffer() {

    // Pobierz userId na podstawie username
    const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
    if (!userResponse.ok) {
        alert('Nie mo¿na znaleŸæ u¿ytkownika.');
        return;
    }

    const userData = await userResponse.json();
    const userId = userData.userId;

    const senderId = userId;
    const receiverId = localStorage.getItem('userId2');

    // Walidacja u¿ytkowników
    if (!senderId || !receiverId) {
        alert('Brakuje danych u¿ytkownika. Upewnij siê, ¿e jesteœ zalogowany i wybra³eœ u¿ytkownika do wymiany.');
        return;
    }

    // Mapy zaznaczonych ksi¹¿ek
    const senderBooksMap = new Map();
    const receiverBooksMap = new Map();

    // Pobierz ksi¹¿ki nadawcy
    document.querySelectorAll('#shelf1 .book-container').forEach((bookContainer) => {
        const bookBack = bookContainer.querySelector('.book-back');
        const bookFront = bookContainer.querySelector('.book-front');

        // SprawdŸ, czy ksi¹¿ka jest oznaczona jako zielona
        const isSelected =
            getComputedStyle(bookBack).background.includes('rgb(168, 213, 162)') && // Zielony gradient
            getComputedStyle(bookBack).borderColor === 'rgb(109, 152, 110)';

        if (isSelected) {
            const title = bookFront.textContent.trim();
            senderBooksMap.set(title, { title });
        }
    });

    // Pobierz ksi¹¿ki odbiorcy
    document.querySelectorAll('#shelf2 .book-container').forEach((bookContainer) => {
        const bookBack = bookContainer.querySelector('.book-back');
        const bookFront = bookContainer.querySelector('.book-front');

        // SprawdŸ, czy ksi¹¿ka jest oznaczona jako zielona
        const isSelected =
            getComputedStyle(bookBack).background.includes('rgb(168, 213, 162)') && // Zielony gradient
            getComputedStyle(bookBack).borderColor === 'rgb(109, 152, 110)';

        if (isSelected) {
            const title = bookFront.textContent.trim();
            receiverBooksMap.set(title, { title });
        }
    });

    console.log('Zaznaczone myBooks:', senderBooksMap);
    console.log('Zaznaczone theirBooks:', receiverBooksMap);

    // SprawdŸ, czy s¹ zaznaczone ksi¹¿ki
    if (senderBooksMap.size === 0 || receiverBooksMap.size === 0) {
        alert('Musisz wybraæ przynajmniej jedn¹ ksi¹¿kê do wymiany po obu stronach.');
        return;
    }

    // Przeœlij oferty wymiany
    try {
        const response = await fetch('http://localhost:3000/api/trades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId,
                receiverId,
                senderBooks: Array.from(senderBooksMap.values()),
                receiverBooks: Array.from(receiverBooksMap.values()),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Nie uda³o siê wys³aæ oferty wymiany: ${errorData.message}`);
            return;
        }

        const trade = await response.json();
        alert('Oferta wymiany zosta³a pomyœlnie wys³ana!');
        console.log('Trade:', trade);

        // Przekierowanie po sukcesie
        localStorage.removeItem('userId2');
        localStorage.removeItem('chosenBook');
        window.location.href = 'userDashboard.html';
    } catch (error) {
        console.error('B³¹d podczas wysy³ania oferty wymiany:', error);
        alert('Wyst¹pi³ b³¹d podczas wysy³ania oferty wymiany. Spróbuj ponownie póŸniej.');
    }
}








