package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	InitDB("valet.db")

	r := mux.NewRouter()

	r.HandleFunc("/api/cars/checkin", CarCheckInHandler).Methods("POST")
	r.HandleFunc("/api/cars/checkout", CarCheckOutHandler).Methods("POST")
	r.HandleFunc("/api/cars/parked", ListParkedCarsHandler).Methods("GET")
	// Serve static frontend
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("../frontend/")))

	log.Println("Server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
