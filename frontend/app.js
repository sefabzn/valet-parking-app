const checkinBtn = document.getElementById('checkin-btn');
const checkinMsg = document.getElementById('checkin-msg');

// On DOMContentLoaded, load cars
window.addEventListener('DOMContentLoaded', () => {
    loadCars();
});

checkinBtn.onclick = async function() {
    const cardNumber = document.getElementById('card-number').value;
    const carModel = document.getElementById('car-model').value;
    const spot = document.getElementById('spot').value;
    checkinMsg.textContent = '';
    if (!cardNumber || !carModel || !spot) {
        checkinMsg.textContent = 'All fields required';
        return;
    }
    const res = await fetch('/api/cars/checkin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ card_number: cardNumber, car_model: carModel, spot })
    });
    if (res.ok) {
        checkinMsg.textContent = 'Checked in!';
        document.getElementById('card-number').value = '';
        document.getElementById('car-model').value = '';
        document.getElementById('spot').value = '';
        // Instantly update table
        await loadCars();
    } else {
        checkinMsg.textContent = 'Check-in failed';
    }
};

let allCars = [];

async function loadCars() {
    const carTableDiv = document.getElementById('car-table');
    if (carTableDiv) carTableDiv.innerHTML = '';
    const res = await fetch('/api/cars/parked');
    if (res.ok) {
        allCars = await res.json();
        renderCars(allCars);
    } else {
        if (carTableDiv) carTableDiv.innerHTML = '<div style="color:red">Could not load cars</div>';
    }
}

function renderCars(cars) {
    // Define new spot names
    const spotNames = [
        "Ön",
        "Kolej",
        "Kolej Karşı",
        "Cami",
        "Cami Ara",
        "Cami Otopark",
        "Otopark"
    ];
    // Group cars by spot
    const spots = {};
    spotNames.forEach(name => spots[name] = []);
    cars.forEach(car => {
        if (spots[car.spot]) {
            spots[car.spot].push(car);
        }
    });
    // Build a table with columns for each spot
    let table = document.createElement('table');
    table.style.width = '100%';
    let header = '<tr>' + spotNames.map(name => `<th>${name}</th>`).join('') + '</tr>';
    table.innerHTML = header;
    // Find max rows needed
    let maxRows = Math.max(...spotNames.map(name => spots[name].length));
    for (let i = 0; i < maxRows; i++) {
        let row = document.createElement('tr');
        spotNames.forEach(spot => {
            let td = document.createElement('td');
            let car = spots[spot][i];
            if (car) {
                td.innerHTML = `<div><b>${car.card_number}</b></div><div>${car.car_model || ''}</div><div>${new Date(car.time_in).toLocaleTimeString()}</div>`;
                let btn = document.createElement('button');
                btn.textContent = 'Check Out';
                btn.onclick = () => checkOutCar(car.id);
                td.appendChild(btn);
            }
            row.appendChild(td);
        });
        table.appendChild(row);
    }
    // Render into car-table
    const carTableDiv = document.getElementById('car-table');
    if (carTableDiv) {
        carTableDiv.innerHTML = '';
        carTableDiv.appendChild(table);
    }
}

// Search bar functionality
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', function() {
        const query = searchBar.value.trim().toLowerCase();
        if (!query) {
            renderCars(allCars);
        } else {
            const filtered = allCars.filter(car => car.card_number.toLowerCase().includes(query));
            renderCars(filtered);
        }
    });
}


async function checkOutCar(id) {
    const res = await fetch(`/api/cars/checkout?id=${id}`, {
        method: 'POST'
    });
    if (res.ok) {
        loadCars();
    } else {
        alert('Check-out failed');
    }
}
