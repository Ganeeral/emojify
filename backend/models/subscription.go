package models

import (
  "time"
)

type Subscription struct {
  ID        uint      `gorm:"primaryKey"`
  UserID    uint      `gorm:"index"`
  ExpiresAt time.Time `gorm:"index"`
  CreatedAt time.Time
}
