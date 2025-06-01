package models

import "time"

type Image struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null"`
	Prompt    string    `gorm:"not null"`
	ImageURL  string    `gorm:"not null"`
	CreatedAt time.Time
}
