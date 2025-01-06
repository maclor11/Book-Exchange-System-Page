const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Funkcja czyszczenia pól formularza
function clearFormFields(form) {
    form.reset();
}

// Rejestracja
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        alert(result.message); // Komunikat obs³uguj¹cy polskie znaki

        if (response.ok) {
            clearFormFields(registerForm); // Czyszczenie pól po sukcesie
        }
    } catch (error) {
        alert('Blad polaczenia z serwerem.');
    }
});

// Logowanie
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('log-username').value;
    const password = document.getElementById('log-password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Komunikat sukcesu
            localStorage.setItem('username', username); // Zapisanie nazwy u¿ytkownika

            const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
            if (!userResponse.ok) {
                alert('Nie mo¿na znaleŸæ u¿ytkownika.');
                return;
            }

            const userData = await userResponse.json();
            const userId = userData.userId;


            // Sprawdzenie, czy userId to admin
            if (userId === '677bbb93c3bf6ee5a20f9c86') {
                window.location.href = 'adminDashboard.html'; // Przekierowanie na adminDashboard
            } else {
                window.location.href = 'userDashboard.html'; // Przekierowanie na userDashboard
            }
        } else {
            alert(result.message); // Komunikat b³êdu
        }
    } catch (error) {
        alert('B³¹d po³¹czenia z serwerem.');
    }
});

