package database

import (
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
	"github.com/Ganeeral/emojify-ai/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	DB   *gorm.DB
	once sync.Once
)

// ConnectDB загружает .env, подключается к PostgreSQL через GORM и сохраняет
// *gorm.DB в переменную DB. Выполняется единожды.
func ConnectDB() {
	once.Do(func() {
		// Загружаем переменные окружения
		if err := godotenv.Load(); err != nil {
			log.Fatalf("Ошибка загрузки .env файла: %v", err)
		}

		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbName := os.Getenv("DB_NAME")

		dsn := fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			dbHost, dbUser, dbPassword, dbName, dbPort,
		)

		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatalf("Не удалось подключиться к базе данных: %v", err)
		}

		// Авто-миграция модели GeneratedImage
		if errAuto := db.AutoMigrate(&models.GeneratedImage{}); errAuto != nil {
			log.Fatalf("Не удалось выполнить AutoMigrate: %v", errAuto)
		}

		DB = db
		fmt.Println("Успешное подключение к базе данных и миграция выполнена")
	})
}
