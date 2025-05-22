package models

import (
	"time"
)

type Request struct {
	ID            uint   `gorm:"primaryKey"`
	UserID        uint   `gorm:"not null"`
	Scene         string `gorm:"not null"`
	Emotion       string `gorm:"not null"`
	CreationDate  time.Time
	User          User `gorm:"foreignKey:UserID"`
}
