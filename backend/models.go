package main

type CarRecord struct {
	ID         int    `json:"id"`
	CardNumber string `json:"card_number"`
	CarModel   string `json:"car_model"`
	Spot       string `json:"spot"`
	TimeIn     string `json:"time_in"`
	TimeOut    *string `json:"time_out"`
}

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"` // hashed
}
