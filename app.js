const checkinBtn = document.getElementById('checkin-btn');
const checkinMsg = document.getElementById('checkin-msg');

let allCars = [];
let dailyStats = {
    date: new Date().toDateString(),
    totalCarsEntered: 0,
    lastResetTime: new Date().getTime(),
    persistentTotal: 0  // This will never reset, only increase
};

// Load daily stats from localStorage if available
function loadDailyStats() {
    const savedStats = localStorage.getItem('dailyStats');
    if (savedStats) {
        try {
            dailyStats = JSON.parse(savedStats);
            
            // Check if it's a new day
            if (dailyStats.date !== new Date().toDateString()) {
                // It's a new day, reset stats but save previous day's count
                const previousCount = dailyStats.totalCarsEntered;
                savePreviousDayStats(dailyStats.date, previousCount);
                
                // Store the persistent total before resetting
                const persistentTotal = dailyStats.persistentTotal || 0;
                
                // Reset for new day but keep the persistent total
                dailyStats = {
                    date: new Date().toDateString(),
                    totalCarsEntered: 0,
                    lastResetTime: new Date().getTime(),
                    persistentTotal: persistentTotal  // Preserve the persistent total
                };
                saveDailyStats();
            }
        } catch (e) {
            console.error('Error parsing daily stats:', e);
            // Create new stats if there was an error
            createDefaultStats();
        }
    } else {
        // No saved stats found, create default
        createDefaultStats();
    }
    
    // Always update the display
    updateDailyStatsDisplay();
}

// Create default stats for first-time users
function createDefaultStats() {
    dailyStats = {
        date: new Date().toDateString(),
        totalCarsEntered: 0,
        lastResetTime: new Date().getTime(),
        persistentTotal: 0
    };
    saveDailyStats();
}

// Save daily stats to localStorage
function saveDailyStats() {
    localStorage.setItem('dailyStats', JSON.stringify(dailyStats));
}

// Save previous day's stats to history
function savePreviousDayStats(date, count) {
    let history = JSON.parse(localStorage.getItem('statsHistory') || '[]');
    history.push({ date, totalCarsEntered: count });
    // Keep only last 30 days
    if (history.length > 30) {
        history = history.slice(history.length - 30);
    }
    localStorage.setItem('statsHistory', JSON.stringify(history));
}

// Schedule daily reset at 11:59 PM
function scheduleDailyReset() {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23, // 11 PM
        59, // 59 minutes
        0 // 0 seconds
    );
    
    // If it's already past 11:59 PM, schedule for next day
    if (now > night) {
        night.setDate(night.getDate() + 1);
    }
    
    const timeToReset = night.getTime() - now.getTime();
    
    // Schedule the reset
    setTimeout(() => {
        resetDailyStats();
        // Schedule the next day's reset
        scheduleDailyReset();
    }, timeToReset);
}
// Update daily stats display to show both daily and persistent totals
function updateDailyStatsDisplay() {
    const dailyStatsDiv = document.getElementById('daily-stats');
    const persistentTotalDiv = document.getElementById('persistent-total');
    const resetInfoDiv = document.getElementById('reset-info');
    
    if (dailyStatsDiv) {
        dailyStatsDiv.textContent = `Bugünkü Toplam: ${dailyStats.totalCarsEntered}`;
    }
    
    if (persistentTotalDiv) {
        persistentTotalDiv.textContent = `Toplam: ${dailyStats.persistentTotal}`;
    }
    
    // Format reset time
    const resetDate = new Date(dailyStats.lastResetTime);
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedTime = resetDate.toLocaleTimeString('tr-TR', options);
    
    if (resetInfoDiv) {
        resetInfoDiv.textContent = `Son Sıfırlama: ${formattedTime}`;
    }
}

// Reset all parked cars (mark them as checked out)
async function resetAllCars() {
    const currentTime = new Date().toISOString();
    const cars = await getAllCars();
    const activeCars = cars.filter(car => !car.time_out);
    
    // Mark all active cars as checked out
    for (const car of activeCars) {
        car.time_out = currentTime;
        await updateCar(car);
    }
    
    // Reload cars to update UI
    await loadCars();
}

// Update the daily stats display
function updateDailyStatsDisplay() {
    const dailyStatsDiv = document.getElementById('daily-stats');
    const persistentTotalDiv = document.getElementById('persistent-total');
    const resetInfoDiv = document.getElementById('reset-info');
    const statsTitleElement = document.getElementById('stats-title');
    
    if (dailyStatsDiv) {
        dailyStatsDiv.textContent = translations[currentLang].dailyTotal.replace('{0}', dailyStats.totalCarsEntered);
    }
    
    if (persistentTotalDiv) {
        persistentTotalDiv.textContent = translations[currentLang].persistentTotal.replace('{0}', dailyStats.persistentTotal || 0);
    }
    
    // Format reset time
    const resetDate = new Date(dailyStats.lastResetTime);
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedTime = resetDate.toLocaleTimeString('tr-TR', options);
    
    if (resetInfoDiv) {
        resetInfoDiv.textContent = translations[currentLang].resetTime.replace('{0}', formattedTime);
    }
    
    if (statsTitleElement) {
        statsTitleElement.textContent = translations[currentLang].statsTitle;
    }
}
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
        confirmCheckout: "Seçilen aracı çıkış yapmak istediğinize emin misiniz?",
        checkin: "Giriş Yap",
        checkout: "Çıkış Yap",
        location: "Konum",
        plate: "Plaka",
        timeIn: "Giriş Saati",
        timeOut: "Çıkış Saati",
        totalCars: "Toplam Araç",
        dailyTotal: "Bugünkü Toplam: {0}",
        persistentTotal: "Toplam: {0}",
        resetData: "Tüm Verileri Sıfırla",
        resetConfirmation: "Tüm verileri sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.",
        resetTime: "Son Sıfırlama: {0}",
        statsTitle: "Günlük İstatistikler"
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
        confirmCheckout: "Are you sure you want to check out the selected car?",
        checkin: "Check In",
        checkout: "Check Out",
        location: "Location",
        plate: "Plate",
        timeIn: "Check-in Time",
        timeOut: "Check-out Time",
        totalCars: "Total Cars",
        dailyTotal: "Daily Total: {0}",
        persistentTotal: "Total: {0}",
        resetData: "Reset All Data",
        resetConfirmation: "Are you sure you want to reset all data? This action cannot be undone.",
        resetTime: "Last Reset: {0}",
        statsTitle: "Daily Statistics"
    }
};

// Add reset button click handler
document.getElementById('reset-data').onclick = async () => {
    if (confirm(translations[currentLang].resetConfirmation)) {
        try {
            // Reset all cars
            await resetAllCars();
            
            // Reset daily stats
            dailyStats = {
                date: new Date().toDateString(),
                totalCarsEntered: 0,
                lastResetTime: new Date().getTime(),
                persistentTotal: 0
            };
            saveDailyStats();
            
            // Clear history
            localStorage.removeItem('statsHistory');
            
            // Update display
            updateDailyStatsDisplay();
            updateTotalCount(0);
            
            // Clear the search input
            const searchBar = document.getElementById('search-bar');
            if (searchBar) {
                searchBar.value = '';
            }
            
            // Show success message
            const checkinMsg = document.getElementById('checkin-msg');
            if (checkinMsg) {
                checkinMsg.textContent = translations[currentLang].checkedIn;
                checkinMsg.style.color = 'green';
                setTimeout(() => {
                    checkinMsg.textContent = '';
                }, 2000);
            }
        } catch (error) {
            console.error('Error resetting data:', error);
            // Show error message
            const checkinMsg = document.getElementById('checkin-msg');
            if (checkinMsg) {
                checkinMsg.textContent = 'Error resetting data';
                checkinMsg.style.color = 'red';
                setTimeout(() => {
                    checkinMsg.textContent = '';
                }, 2000);
            }
        }
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
    
    // Update daily statistics display with new language
    updateDailyStatsDisplay();
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

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    langSwitcher.value = currentLang;
    setLanguage(currentLang);
    loadCars();
    
    // Initialize daily stats tracking
    loadDailyStats();
    
    // Schedule daily reset at 11:59 PM
    scheduleDailyReset();
});

checkinBtn.onclick = async () => {
    const cardNumber = document.getElementById('card-number').value;
    const carModel = document.getElementById('car-model').value;
    const spot = document.getElementById('spot').value;

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
    
    // Increment both daily and persistent counters
    dailyStats.totalCarsEntered++;
    dailyStats.persistentTotal = (dailyStats.persistentTotal || 0) + 1;
    saveDailyStats();
    updateDailyStatsDisplay();
    
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
    updateTotalCount(allCars.length);
    
    // Always ensure daily stats are loaded and displayed
    loadDailyStats();
}

function updateTotalCount(count) {
    const totalCountElement = document.getElementById('total-cars-count');
    if (totalCountElement) {
        const countText = translations[currentLang].totalCars.replace('{0}', count);
        totalCountElement.textContent = countText;
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
        // Make sure the total count is updated
        updateTotalCount(allCars.length);
    };
    req.onerror = () => alert('Check-out failed');
}
