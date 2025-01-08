// Pobranie nazwy u�ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');
const userId2 = localStorage.getItem('userId2');
const selectedBooks1 = new Array();
const selectedBooks2 = new Array();

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
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Pobierz ksi��ki u�ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId}`);
        const userBooks = await response.json();

        // Pobierz kontener p�ki
        const shelf = document.getElementById('shelf1');
        shelf.innerHTML = ''; // Wyczy�� p�k�

        // Wy�wietl ksi��ki na p�ce
        userBooks.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong><br> <span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
                <button class="select-button">Wybierz</button>
            `;


            bookBack.querySelector('.select-button').addEventListener('click', (event) => {
                const button = event.target;
                const bookBack = button.closest('.book-back'); // Znalezienie rodzica .book-back
                const bookFront = bookBack.parentElement.querySelector('.book-front');

                if (button.textContent === 'Wybierz') {
                    button.textContent = 'Usu�';
                    bookBack.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookBack.style.border = '1px solid #6d986e';
                    bookFront.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookFront.style.border = '1px solid #6d986e';
                    // Dodanie ksi��ki do mapy (zaznaczenie)
                    selectedBooks1.push(bookId._id);
                } else {
                    button.textContent = 'Wybierz';
                    bookBack.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookBack.style.border = '1px solid #b0a890';
                    bookFront.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookFront.style.border = '1px solid #b0a890';
                    // Dodanie ksi��ki do mapy (zaznaczenie)
                    selectedBooks1.pop(bookId._id);
                }
            });

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

async function displayTradeBooks() {
    try {
        // Pobierz ksi��ki u�ytkownika
        const response = await fetch(`http://localhost:3000/api/user-books/${userId2}`);
        const userBooks = await response.json();


        // Pobierz kontener p�ki
        const shelf = document.getElementById('shelf2');
        shelf.innerHTML = ''; // Wyczy�� p�k�

        // Wy�wietl ksi��ki na p�ce
        userBooks.forEach(({ bookId }) => {
            const bookContainer = document.createElement('div');
            bookContainer.classList.add('book-container');

            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');

            const bookFront = document.createElement('div');
            bookFront.classList.add('book-face', 'book-front');
            bookFront.innerHTML = `<strong title="${bookId.title}">${bookId.title}</strong>`;

            const bookBack = document.createElement('div');
            bookBack.classList.add('book-face', 'book-back');
            bookBack.innerHTML = `
                <p><strong>Autor:</strong> <br><span title="${bookId.author}">${bookId.author}</span></p>
                <p><strong>Opis:</strong> ${bookId.description || 'Brak opisu.'}</p>
                <button class="select-button">Wybierz</button>
            `;

            bookBack.querySelector('.select-button').addEventListener('click', (event) => {
                const button = event.target;
                const bookBack = button.closest('.book-back'); // Znalezienie rodzica .book-back
                const bookFront = bookBack.parentElement.querySelector('.book-front');

                if (button.textContent === 'Wybierz') {
                    button.textContent = 'Usu�';
                    bookBack.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookBack.style.border = '1px solid #6d986e';
                    bookFront.style.background = 'linear-gradient(135deg, #a8d5a2, #8fc98e)'; // Gradient zielony
                    bookFront.style.border = '1px solid #6d986e';
                    // Dodanie ksi��ki do mapy (zaznaczenie)
                    selectedBooks2.push(bookId._id);
                } else {
                    button.textContent = 'Wybierz';
                    bookBack.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookBack.style.border = '1px solid #b0a890';
                    bookFront.style.background = 'linear-gradient(135deg, #f5f3eb, #e8e4d9)'; // Oryginalny gradient
                    bookFront.style.border = '1px solid #b0a890';
                    // Dodanie ksi��ki do mapy (zaznaczenie)
                    selectedBooks2.pop(bookId._id);
                }
            });

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

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}

async function sendTradeOffer() {
    try {
        // Pobierz userId na podstawie username
        const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!userResponse.ok) {
            alert('Nie mo�na znale�� u�ytkownika.');
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.userId;

        // Je�li nie ma wybranych ksi��ek, przerwij
        if (selectedBooks1.length === 0 || selectedBooks2.length === 0) {
            alert(selectedBooks1.length);
            return;
        }

        const response = await fetch('http://localhost:3000/api/trades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, userId2, selectedBooks1, selectedBooks2 })
        });

        if (!response.ok) {
            const errorResponse = await response.text();  // Odczytaj odpowied� serwera w postaci tekstu
            console.error('B��d odpowiedzi serwera:', errorResponse);
            alert('Wyst�pi� b��d podczas wysy�ania oferty wymiany.');
            return;
        }

        const responseData = await response.json();
        console.log('Response from server:', responseData);

        alert("Oferta wymiany zosta�a wys�ana pomy�lnie!");
        // Przekierowanie do strony z ofert� wymiany lub innego widoku
        window.location.href = 'userDashboard.html';
        localStorage.removeItem("userId2");
    } catch (error) {
        console.error('B��d podczas wysy�ania oferty wymiany:', error);
        alert('Wyst�pi� b��d podczas wysy�ania oferty wymiany.');
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('shelf1');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('shelf2');
    shelf.addEventListener('click', (event) => {
        const book = event.target.closest('.book');
        if (book) {
            book.classList.toggle('flipped');
        }
    });
});











