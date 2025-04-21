package main

import (
	"encoding/json"
	"net/http"
	"time"
	"strconv"
)

// POST /api/cars/checkin
func CarCheckInHandler(w http.ResponseWriter, r *http.Request) {
	var car CarRecord
	if err := json.NewDecoder(r.Body).Decode(&car); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	car.TimeIn = time.Now().Format(time.RFC3339)
	id, err := InsertCarRecord(car)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	car.ID = int(id)
	json.NewEncoder(w).Encode(car)
}

// POST /api/cars/checkout/{id}
func CarCheckOutHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	timeOut := time.Now().Format(time.RFC3339)
	if err := UpdateCarCheckout(id, timeOut); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Checked out"))
}

// GET /api/cars/parked
func ListParkedCarsHandler(w http.ResponseWriter, r *http.Request) {
	cars, err := ListParkedCars()
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(cars)
}
	
