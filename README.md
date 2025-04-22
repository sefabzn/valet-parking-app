# Valet Parking App

A modern, offline-first valet car parking app. No login required. Quickly check in/out cars, search, and view all parked cars with a responsive UI. Works entirely in your browser—no backend or server needed.

---

## Features
- **Check In/Out:** Record cars by card number, model, and parking spot.
- **Spot Management:** Custom, named parking spots.
- **Live Search:** Instantly filter parked cars by card number.
- **Responsive UI:** Works great on desktop, tablets, and phones.
- **No Login:** Designed for fast, local use.
- **Offline-First:** All data is stored in your browser (IndexedDB). No internet required after first load.
- **PWA:** Installable as a mobile/desktop app (Add to Home Screen/Install App prompt).
- **Language Switcher:** Instantly switch between Turkish and English.
- **Deployed on GitHub Pages:** [https://sefabzn.github.io/valet-parking-app/](https://sefabzn.github.io/valet-parking-app/)

---

## Project Structure
```
ValetProject/
├── frontend/
│   ├── index.html        # Main UI
│   ├── app.js            # Frontend logic
│   ├── style.css         # Styling
│   ├── manifest.json     # PWA manifest
│   ├── icon-192.png      # PWA icon
│   ├── icon-512.png      # PWA icon
│   └── apple-touch-icon.png # iOS PWA icon
│
├── README.md
└── ...
```

---

## Getting Started

### Online (Recommended)
Just visit: [https://sefabzn.github.io/valet-parking-app/](https://sefabzn.github.io/valet-parking-app/)

- Works on any modern browser (Chrome, Edge, Firefox, Safari, mobile or desktop)
- For offline use: open the site once, then "Install App" or "Add to Home Screen" from your browser menu
- Switch language using the dropdown at the top right

### Local (Advanced)
1. Clone this repository
2. Open `frontend/index.html` in your browser

---

## Usage
- **Check In:** Enter card number, car model, and select a spot. Click Giriş Yap/Check In.
- **Check Out:** Click "Çıkış Yap"/"Check Out" next to a car to remove it from the lot (with confirmation).
- **Search:** Use the search bar to filter parked cars by card number.
- **Language:** Use the dropdown at the top right to switch between Türkçe and English.
- **Install:** Look for the "Install App" or "Add to Home Screen" option in your browser for a native-like experience.

---

## Notes
- No authentication or user management is included.
- All data is stored locally in your browser (IndexedDB). Clearing browser data will reset the app.
- No backend/server is required or used.

---

## Deployment
- The app is deployed using GitHub Pages from the `frontend` folder.
- To deploy updates:
  1. Commit your changes to the main branch
  2. Push the frontend to GitHub Pages:
     ```sh
     git subtree push --prefix frontend origin gh-pages
     ```

---

## License
MIT

- Go 1.18+
- Node.js (optional, only if you want to use npm tooling for frontend)

### Backend
1. Open a terminal in `backend/`.
2. Run:
   ```sh
   go run main.go db.go handlers.go models.go
   ```
   This starts the API server at [http://localhost:8080](http://localhost:8080).

### Frontend
- Open `frontend/index.html` in your browser, or access via the Go server if it serves static files.

---

## Usage
- **Check In:** Enter card number, car model, and select a spot. Click Check In.
- **Check Out:** Click "Check Out" next to a car to remove it from the lot.
- **Search:** Use the search bar to filter parked cars by card number.

---

## Notes
- No authentication or user management is included.
- All data is stored locally in `backend/valet.db` (SQLite).
- For a fresh start, stop the server and delete `valet.db`.

---

## License
MIT
