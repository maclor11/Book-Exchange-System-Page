const tradeId = localStorage.getItem('tradeId');
const username = localStorage.getItem('username');

if (username) {
    document.getElementById('username').innerText = username;
} else {
    window.location.href = 'index.html'; // Jeśli brak nazwy, wraca do logowania
}

function goBack() {
    window.location.href = "userDashboard.html";
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('pl-PL', options);
    const time = now.toLocaleTimeString('pl-PL');

    document.getElementById('currentDateTime').textContent = `${date}, ${time}`;
}

// Aktualizacja co sekundę
setInterval(updateDateTime, 1000);

window.onload = () => {
    updateDateTime();
};


async function addOpinion() {
    // Pobierz wartości z formularza
    const message = document.getElementById("bookReview").value; // Tekst opinii
    const stars = document.getElementById("bookRating").value; // Ocena (liczba gwiazdek)

    if (!message || !stars) {
        alert("Wszystkie pola muszą być wypełnione.");
        return;
    }

    try {
        // Najpierw musimy pobrać dane wymiany (trade), aby uzyskać userId
        const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Wystąpił problem z pobraniem wymiany');
        }



        const trade = data;
        const userId = trade.userId2; // ID użytkownika, któremu wystawiamy opinię

        // Teraz wykonaj POST, aby dodać opinię
        const opinionData = {
            userId: userId,
            tradeId: tradeId,
            message: message,
            stars: parseInt(stars, 10)
        };

        const postResponse = await fetch('http://localhost:3000/api/opinions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(opinionData)
        });

        const postData = await postResponse.json();

        const response1 = await fetch(`http://localhost:3000/api/trades/${tradeId}/reviewed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewed: 1 })
        });

        if (postResponse.ok) {
            alert('Opinia została pomyślnie dodana');
            // Możesz dodać jakieś działania po zapisaniu opinii (np. wyczyścić formularz)
            document.getElementById("bookReview").value = "";
            document.getElementById("bookRating").value = "1"; // Ustawienie domyślnej wartości
        } else {
            throw new Error(postData.message || 'Wystąpił błąd podczas dodawania opinii');
        }
        window.location.href = "userDashBoard.html";
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas dodawania opinii');
    }
}