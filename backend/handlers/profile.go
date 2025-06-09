package handlers

import (
	"net/http"
    "time"

	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/models"
	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userID := c.GetUint("userID")
	var sub models.Subscription

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	var requests []models.Request
	if err := database.DB.Where("user_id = ?", userID).Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных запросов"})
		return
	}

	if err := database.DB.
		Where("user_id = ? AND expires_at > ?", user.ID, time.Now()).
		First(&sub).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"id":                   user.ID,
			"name":                 user.Name,
			"email":                user.Email,
			"avatar":               user.Avatar,
			"subscription_expires": sub.ExpiresAt, // ← новоe
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"id":                   user.ID,
			"name":                 user.Name,
			"email":                user.Email,
			"avatar":               user.Avatar,
			"subscription_expires": nil,
		})
	}
}
