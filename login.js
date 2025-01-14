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
        alert(result.message); // Komunikat obsługujący polskie znaki

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
            body: JSON.stringify({ username, password}),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Komunikat sukcesu
            localStorage.setItem('username', username); // Zapisanie nazwy użytkownika

            const userResponse = await fetch(`http://localhost:3000/api/users/${username}`);
            if (!userResponse.ok) {
                alert('Nie można znaleźć użytkownika.');
                return;
            }

            const userData = await userResponse.json();
            const userId = userData.userId;


            const statusResponse = await fetch(`http://localhost:3000/api/users/by-id/status/${userId}`);
            if (!statusResponse.ok) {
                alert('Nie można znaleźć użytkownika.');
                return;
            }
            const statusData = await statusResponse.json();
            const isAdmin = statusData.isAdmin;
            // Sprawdzenie, czy userId to admin
            if (isAdmin === 1) {
                window.location.href = 'adminDashboard.html'; // Przekierowanie na adminDashboard
            } else {
                window.location.href = 'userDashboard.html'; // Przekierowanie na userDashboard
            }
        } else {
            alert(result.message); // Komunikat błędu
        }
    } catch (error) {
        alert('Błąd połączenia z serwerem.');
    }


});

function validateUsername() {
    const username = document.getElementById('reg-username').value;
    const usernameError = document.getElementById('username-error');
    const registerButton = document.getElementById('register-button');

    if (username.length > 10) {
        usernameError.style.display = 'inline';
        registerButton.disabled = true;  // Dezaktywuje przycisk rejestracji
    } else {
        usernameError.style.display = 'none';
        registerButton.disabled = false; // Aktywuje przycisk rejestracji
    }
}

// Funkcja walidacji hasła
function validatePassword() {
    const password = document.getElementById('reg-password').value;
    const passwordError = document.getElementById('password-error');
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/; // Hasło musi mieć przynajmniej jedną dużą literę i cyfrę

    if (!passwordRegex.test(password)) {
        passwordError.style.display = 'inline';
    } else {
        passwordError.style.display = 'none';
    }
}

