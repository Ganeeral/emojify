package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v4/pgxpool" // Используем pgx для PostgreSQL
)

// Структуры запросов и ответов
type EmotionRequest struct {
	UserID int    `json:"user_id" binding:"required"` // user_id обязательный
	Scene  string `json:"scene" binding:"required"`   // Описание сцены
}

type EmotionResponse struct {
	Emotion string `json:"emotion"` // Результат анализа эмоции
}

var db *pgxpool.Pool // Используем pgxpool для управления соединениями

// Установка соединения с базой данных
func SetDB(database *pgxpool.Pool) {
	db = database
}

// Основной обработчик анализа сцены
func AnalyzeScene(c *gin.Context) {
	var req EmotionRequest

	// Валидация входных данных
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	// Отправляем сцену на Node.js сервер для анализа эмоций
	emotion, err := fetchEmotionFromNode(req.Scene)
	if err != nil {
		log.Printf("Ошибка при обращении к Node.js серверу: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка анализа эмоции"})
		return
	}

	// Сохраняем результат в базу данных
	err = saveEmotionToDB(req.UserID, req.Scene, emotion.Emotion)
	if err != nil {
		log.Printf("Ошибка сохранения в базу данных: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить данные"})
		return
	}

	// Возвращаем результат
	c.JSON(http.StatusOK, emotion)
}

// Функция отправки данных на Node.js сервер
func fetchEmotionFromNode(scene string) (EmotionResponse, error) {
	var result EmotionResponse

	// Адрес Node.js сервера
	nodeServerURL := "https://backend-ai.cloudpub.ru/analyze"

	// Подготовка тела запроса
	requestBody, err := json.Marshal(map[string]string{"scene": scene})
	if err != nil {
		return result, fmt.Errorf("ошибка формирования тела запроса: %v", err)
	}

	// Отправка POST-запроса
	resp, err := http.Post(nodeServerURL, "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		return result, fmt.Errorf("ошибка отправки запроса на сервер: %v", err)
	}
	defer resp.Body.Close()

	// Проверка кода ответа
	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("сервер вернул код %d", resp.StatusCode)
	}

	// Декодирование ответа
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, fmt.Errorf("ошибка декодирования ответа: %v", err)
	}

	return result, nil
}

// Функция сохранения эмоции в базу данных
func saveEmotionToDB(userID int, scene, emotion string) error {
	_, err := db.Exec(context.Background(), `
		INSERT INTO requests (user_id, scene, emotion, created_at)
		VALUES ($1, $2, $3, $4)
	`, userID, scene, emotion, time.Now())

	if err != nil {
		return fmt.Errorf("ошибка сохранения в базу данных: %v", err)
	}

	return nil
}
