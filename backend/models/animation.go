package models

import (
	"time"
)

type Animation struct {
	ID           uint   `gorm:"primaryKey"`
	UserID       uint   `gorm:"not null"`
	RequestID    uint   `gorm:"not null"`
	AnimationURL string `gorm:"size:255"`
	CreatedAt    time.Time
	User         User    `gorm:"foreignKey:UserID"`
	Request      Request `gorm:"foreignKey:RequestID"`
}
