# Valet Parking App

A lightweight, local-first valet car parking recording app. No login required. Quickly check in/out cars, search, and view all parked cars with a responsive UI.

---

## Features
- **Check In/Out:** Record cars by card number, model, and parking spot.
- **Spot Management:** Custom, named parking spots.
- **Live Search:** Instantly filter parked cars by card number.
- **Responsive UI:** Works great on desktop, tablets, and phones.
- **No Login:** Designed for fast, local use.

---

## Project Structure
```
ValetProject/
├── backend/
│   ├── main.go           # Entry point
│   ├── handlers.go       # HTTP handlers (no auth)
│   ├── middleware.go     # (No longer used)
│   ├── models.go         # CarRecord struct
│   ├── db.go             # SQLite DB logic
│   ├── valet.db          # SQLite database (auto-generated)
│   ├── go.mod, go.sum    # Go dependencies
│
├── frontend/
│   ├── index.html        # Main UI
│   ├── app.js            # Frontend logic
│   └── style.css         # (Optional extra styling)
│
├── README.md
└── .windsurfrules
```

---

## Getting Started

### Prerequisites
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
