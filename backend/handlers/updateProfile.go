package handlers

import (
	"net/http"

	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/models"
	"github.com/gin-gonic/gin"
)

func UpdateProfile(c *gin.Context) {
	// Получение ID пользователя из middleware
	userID := c.GetUint("userID")

	var input struct {
		Name string `json:"name" binding:"required"`
	}

	// Проверяем входные данные
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Имя не может быть пустым"})
		return
	}

	// Находим пользователя в базе данных
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Обновляем имя пользователя
	user.Name = input.Name
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить профиль"})
		return
	}

	// Возвращаем успешный ответ
	c.JSON(http.StatusOK, gin.H{
		"message": "Имя успешно обновлено",
		"name":    user.Name,
	})
}
