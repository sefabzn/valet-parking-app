const checkinBtn = document.getElementById('checkin-btn');
const checkinMsg = document.getElementById('checkin-msg');

let allCars = [];
// --- Language switching ---
const translations = {
    tr: {
        title: "Vale Park Uygulaması",
        mainHeading: "Vale Park",
        checkInHeading: "Araç Girişi",
        cardNumber: "Kart Numarası",
        carModel: "Araç Modeli",
        checkInBtn: "Giriş Yap",
        parkedCars: "Park Halindeki Araçlar",
        searchPlaceholder: "Kart Numarası ile Ara",
        allFieldsRequired: "Tüm alanlar zorunludur",
        checkedIn: "Giriş yapıldı!",
        noCars: "Park halinde araç yok.",
        checkOut: "Çıkış Yap",
        confirmCheckout: "Seçilen aracı çıkış yapmak istediğinize emin misiniz?"
    },
    en: {
        title: "Valet Parking App",
        mainHeading: "Valet Parking",
        checkInHeading: "Check In Car",
        cardNumber: "Card Number",
        carModel: "Car Model",
        checkInBtn: "Check In",
        parkedCars: "Parked Cars",
        searchPlaceholder: "Search by Card Number",
        allFieldsRequired: "All fields required",
        checkedIn: "Checked in!",
        noCars: "No cars parked.",
        checkOut: "Check Out",
        confirmCheckout: "Are you sure you want to check out the selected car?"
    }
};

function setLanguage(lang) {
    const t = translations[lang];
    document.title = t.title;
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = t.mainHeading;
    const checkInHeading = document.querySelector('.left-panel h2');
    if (checkInHeading) checkInHeading.textContent = t.checkInHeading;
    const cardInput = document.getElementById('card-number');
    if (cardInput) cardInput.placeholder = t.cardNumber;
    const modelInput = document.getElementById('car-model');
    if (modelInput) modelInput.placeholder = t.carModel;
    const checkInBtnEl = document.getElementById('checkin-btn');
    if (checkInBtnEl) checkInBtnEl.textContent = t.checkInBtn;
    const parkedHeading = document.querySelector('.right-panel h2');
    if (parkedHeading) parkedHeading.textContent = t.parkedCars;
    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.placeholder = t.searchPlaceholder;
    // Save lang
    localStorage.setItem('lang', lang);
    // Re-render cars to update button labels and empty state
    currentLang = lang;
    renderCars(allCars);
}

window.setLanguage = setLanguage;

const langSwitcher = document.getElementById('lang-switcher');
let currentLang = localStorage.getItem('lang') || 'tr';
if (langSwitcher) {
    langSwitcher.value = currentLang;
    langSwitcher.addEventListener('change', function() {
        setLanguage(langSwitcher.value);
    });
}
setLanguage(currentLang);

// --- End language switching ---

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
        checkinMsg.textContent = translations[currentLang].allFieldsRequired;
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
    checkinMsg.textContent = translations[currentLang].checkedIn;
setTimeout(() => {
    checkinMsg.textContent = '';
}, 2000);
    document.getElementById('card-number').value = '';
    document.getElementById('car-model').value = '';
    document.getElementById('spot').value = '';
    await loadCars();
};


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
                td.innerHTML = `<div><b>${car.card_number}</b></div><div>${car.car_model || ''}</div><div>${new Date(car.time_in).toLocaleTimeString(currentLang === 'tr' ? 'tr-TR' : 'en-US')}</div>`;
                let btn = document.createElement('button');
                btn.textContent = translations[currentLang].checkOut;
                btn.onclick = () => {
                    const confirmMsg = translations[currentLang].confirmCheckout || (currentLang === 'tr' ? 'Seçilen aracı çıkış yapmak istediğinize emin misiniz?' : 'Are you sure you want to check out the selected car?');
                    if (window.confirm(confirmMsg)) {
                        checkOutCar(car.id);
                    }
                };
                td.appendChild(btn);
            }
            row.appendChild(td);
        });
        table.appendChild(row);
    }
    const carTableDiv = document.getElementById('car-table');
    if (!carTableDiv) return;
    if (cars.length === 0) {
        carTableDiv.innerHTML = `<div style='color:gray'>${translations[currentLang].noCars}</div>`;
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
