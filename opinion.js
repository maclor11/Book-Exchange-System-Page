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

// Aktualizacja co sekundê
setInterval(updateDateTime, 1000);

window.onload = () => {
    updateDateTime();
};


async function addOpinion() {
    // Pobierz wartoœci z formularza
    const message = document.getElementById("bookReview").value; // Tekst opinii
    const stars = document.getElementById("bookRating").value; // Ocena (liczba gwiazdek)

    if (!message || !stars) {
        alert("Wszystkie pola musz¹ byæ wype³nione.");
        return;
    }

    try {
        // Najpierw musimy pobraæ dane wymiany (trade), aby uzyskaæ userId
        const response = await fetch(`http://localhost:3000/api/trades/by-id/${tradeId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Wyst¹pi³ problem z pobraniem wymiany');
        }

        const trade = data;
        const userId = trade.userId; // ID u¿ytkownika, któremu wystawiamy opiniê

        // Teraz wykonaj POST, aby dodaæ opiniê
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
            alert('Opinia zosta³a pomyœlnie dodana');
            // Mo¿esz dodaæ jakieœ dzia³ania po zapisaniu opinii (np. wyczyœciæ formularz)
            document.getElementById("bookReview").value = "";
            document.getElementById("bookRating").value = "1"; // Ustawienie domyœlnej wartoœci
        } else {
            throw new Error(postData.message || 'Wyst¹pi³ b³¹d podczas dodawania opinii');
        }
        window.location.href = "userDashBoard.html";
    } catch (error) {
        console.error('B³¹d:', error);
        alert('Wyst¹pi³ b³¹d podczas dodawania opinii');
    }
}
