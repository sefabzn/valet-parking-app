package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func InitDB(filepath string) {
	var err error
	db, err = sql.Open("sqlite3", filepath)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	createTables()
}

func createTables() {
	carTable := `CREATE TABLE IF NOT EXISTS car_records (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		card_number TEXT NOT NULL,
		car_model TEXT NOT NULL,
		spot TEXT NOT NULL,
		time_in TEXT NOT NULL,
		time_out TEXT
	);`
	userTable := `CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);`
	if _, err := db.Exec(carTable); err != nil {
		log.Fatalf("Failed to create car_records table: %v", err)
	}
	if _, err := db.Exec(userTable); err != nil {
		log.Fatalf("Failed to create users table: %v", err)
	}
}

// CarRecord CRUD
func InsertCarRecord(car CarRecord) (int64, error) {
	stmt, err := db.Prepare("INSERT INTO car_records (card_number, car_model, spot, time_in) VALUES (?, ?, ?, ?)")
	if err != nil {
		return 0, err
	}
	res, err := stmt.Exec(car.CardNumber, car.CarModel, car.Spot, car.TimeIn)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func UpdateCarCheckout(id int, timeOut string) error {
	_, err := db.Exec("UPDATE car_records SET time_out = ? WHERE id = ?", timeOut, id)
	return err
}

func ListParkedCars() ([]CarRecord, error) {
	rows, err := db.Query("SELECT id, card_number, car_model, spot, time_in, time_out FROM car_records WHERE time_out IS NULL")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var cars []CarRecord
	for rows.Next() {
		var car CarRecord
		var timeOut sql.NullString
		if err := rows.Scan(&car.ID, &car.CardNumber, &car.CarModel, &car.Spot, &car.TimeIn, &timeOut); err != nil {
			return nil, err
		}
		if timeOut.Valid {
			car.TimeOut = &timeOut.String
		} else {
			car.TimeOut = nil
		}
		cars = append(cars, car)
	}
	return cars, nil
}

// User CRUD (minimal, for authentication)
func GetUserByUsername(username string) (*User, error) {
	row := db.QueryRow("SELECT id, username, password FROM users WHERE username = ?", username)
	var user User
	if err := row.Scan(&user.ID, &user.Username, &user.Password); err != nil {
		return nil, err
	}
	return &user, nil
}

func InsertUser(user User) (int64, error) {
	stmt, err := db.Prepare("INSERT INTO users (username, password) VALUES (?, ?)")
	if err != nil {
		return 0, err
	}
	res, err := stmt.Exec(user.Username, user.Password)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}
