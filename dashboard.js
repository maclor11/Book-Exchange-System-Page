// Pobranie nazwy u¿ytkownika z lokalnego przechowywania
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

// Wyœwietlenie nazwy u¿ytkownika lub przekierowanie do logowania
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

// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);


window.onload = () => {
    updateDateTime();
};


// Funkcja wylogowania (jeœli potrzebna w przysz³oœci)
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
