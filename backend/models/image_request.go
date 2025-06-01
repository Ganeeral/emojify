package models

import "gorm.io/gorm"

// GeneratedImage хранит параметры запроса, статус генерации,
// UUID задачи FusionBrain и сам закодированный в base64 результат.
type GeneratedImage struct {
	gorm.Model
	UserID     int    `gorm:"not null"`
	Query      string `gorm:"type:text;not null"`
	Style      string `gorm:"size:100"`
	Width      int
	Height     int
	UUID       string `gorm:"uniqueIndex;not null"`
	Status     string `gorm:"size:20;not null"`     // PENDING, DONE, FAILED и т.п.
	ImageB64   string `gorm:"type:text;default:''"` // Base64-картинка (пустая, пока не DONE)
	ImageBytes []byte `gorm:"type:bytea"`
}
