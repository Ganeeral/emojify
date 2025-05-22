package main

import (
	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/models"
)

func migrate() {
	// Подключаемся к базе данных
	database.ConnectDB()

	// Миграция моделей (создание таблиц)
	database.DB.AutoMigrate(&models.User{}, &models.Request{}, &models.Animation{})
}
