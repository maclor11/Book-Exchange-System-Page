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
            body: JSON.stringify({ username, password}),
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


            const statusResponse = await fetch(`http://localhost:3000/api/users/by-id/status/${userId}`);
            if (!statusResponse.ok) {
                alert('Nie mo¿na znaleŸæ u¿ytkownika.');
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
            alert(result.message); // Komunikat b³êdu
        }
    } catch (error) {
        alert('B³¹d po³¹czenia z serwerem.');
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

// Funkcja walidacji has³a
function validatePassword() {
    const password = document.getElementById('reg-password').value;
    const passwordError = document.getElementById('password-error');
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/; // Has³o musi mieæ przynajmniej jedn¹ du¿¹ literê i cyfrê

    if (!passwordRegex.test(password)) {
        passwordError.style.display = 'inline';
    } else {
        passwordError.style.display = 'none';
    }
}

