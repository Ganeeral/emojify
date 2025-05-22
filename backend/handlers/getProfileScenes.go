package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/Ganeeral/emojify-ai/database"
    "github.com/Ganeeral/emojify-ai/models"
)

func GetProfileScenes(c *gin.Context) {
    userID := c.GetUint("userID")

    var requests []models.Request 
    if err := database.DB.Where("user_id = ?", userID).Find(&requests).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных запросов"})
        return
    }

    if len(requests) == 0 {
        c.JSON(http.StatusOK, gin.H{"message": "Нет доступных сцен"})
        return
    }

    c.JSON(http.StatusOK, requests) 
}

