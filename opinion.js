const tradeId = localStorage.getItem('tradeId');

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

// Aktualizacja co sekund�
setInterval(updateDateTime, 1000);

window.onload = () => {
    updateDateTime();
};


async function addOpinion() {
    // Pobierz warto�ci z formularza
    const message = document.getElementById("bookReview").value; // Tekst opinii
    const stars = document.getElementById("bookRating").value; // Ocena (liczba gwiazdek)

    if (!message || !stars) {
        alert("Wszystkie pola musz� by� wype�nione.");
        return;
    }

    try {
        // Najpierw musimy pobra� dane wymiany (trade), aby uzyska� userId
        const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Wyst�pi� problem z pobraniem wymiany');
        }

        const trade = data;
        const userId = trade.userId; // ID u�ytkownika, kt�remu wystawiamy opini�

        // Teraz wykonaj POST, aby doda� opini�
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

        if (postResponse.ok) {
            alert('Opinia zosta�a pomy�lnie dodana');
            // Mo�esz doda� jakie� dzia�ania po zapisaniu opinii (np. wyczy�ci� formularz)
            document.getElementById("bookReview").value = "";
            document.getElementById("bookRating").value = "1"; // Ustawienie domy�lnej warto�ci
        } else {
            throw new Error(postData.message || 'Wyst�pi� b��d podczas dodawania opinii');
        }
        window.location.href = "userDashBoard.html";
    } catch (error) {
        console.error('B��d:', error);
        alert('Wyst�pi� b��d podczas dodawania opinii');
    }
}
