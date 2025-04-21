const checkinBtn = document.getElementById('checkin-btn');
const checkinMsg = document.getElementById('checkin-msg');

// Search functionality
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', async function() {
        const query = searchBar.value.trim().toLowerCase();
        if (!query) {
            await loadCars();
            return;
        }
        const cars = await getAllCars();
        const filtered = cars.filter(car =>
            !car.time_out && car.card_number.toLowerCase().includes(query)
        );
        renderCars(filtered);
    });
}

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
    // Add car to IndexedDB
    const car = {
        id: Date.now(),
        card_number: cardNumber,
        car_model: carModel,
        spot: spot,
        time_in: new Date().toISOString(),
        time_out: null
    };
    await addCar(car);
    checkinMsg.textContent = 'Checked in!';
    document.getElementById('card-number').value = '';
    document.getElementById('car-model').value = '';
    document.getElementById('spot').value = '';
    await loadCars();
};

let allCars = [];

// IndexedDB helpers
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('valet_parking', 1);
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('cars')) {
                db.createObjectStore('cars', { keyPath: 'id' });
            }
        };
        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

async function addCar(car) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('cars', 'readwrite');
        tx.objectStore('cars').add(car);
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

async function getAllCars() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('cars', 'readonly');
        const store = tx.objectStore('cars');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

async function updateCar(car) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('cars', 'readwrite');
        tx.objectStore('cars').put(car);
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

// Already implemented above, but ensure UI integration below.

async function loadCars() {
    allCars = (await getAllCars()).filter(car => !car.time_out);
    renderCars(allCars);
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
            }
            row.appendChild(td);
        });
        table.appendChild(row);
    }
        const carTableDiv = document.getElementById('car-table');
    if (!carTableDiv) return;
    if (cars.length === 0) {
        carTableDiv.innerHTML = '<div style="color:gray">No cars parked.</div>';
        return;
    }
    // Render the grouped-by-spot table
    carTableDiv.innerHTML = '';
    carTableDiv.appendChild(table);
}

window.handleCheckOut = async function(id) {
    await checkOutCar(id);
}

async function checkOutCar(id) {
    const db = await openDB();
    const tx = db.transaction('cars', 'readwrite');
    const store = tx.objectStore('cars');
    const req = store.get(id);
    req.onsuccess = async () => {
        const car = req.result;
        car.time_out = new Date().toISOString();
        await updateCar(car);
        await loadCars();
    };
    req.onerror = () => alert('Check-out failed');
}
