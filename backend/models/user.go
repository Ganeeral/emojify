package models

import (
	"time"
)

type User struct {
	ID               uint      `gorm:"primaryKey"`
	Email			 string    `gorm:"size:100"`
	Name             string    `gorm:"size:100"`
	Password         string    `gorm:"size:255"`
	Role             int       `gorm:"size:11"`
	RegistrationDate time.Time
	Avatar           string `gorm:"size:255"`
}
