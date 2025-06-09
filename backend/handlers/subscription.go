package handlers

import (
  "net/http"
  "time"

  "github.com/Ganeeral/emojify-ai/database"
  "github.com/Ganeeral/emojify-ai/models"
  "github.com/gin-gonic/gin"
)

type PurchaseInput struct {
  Days int `json:"days"` // 1, 7 или 30
}

func PurchaseSubscription(c *gin.Context) {
  userID := c.GetUint("userID")
  var input PurchaseInput
  if err := c.ShouldBindJSON(&input); err != nil || (input.Days != 1 && input.Days != 7 && input.Days != 30) {
    c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный период подписки"})
    return
  }

  now := time.Now()
  expires := now.Add(time.Duration(input.Days) * 24 * time.Hour)

  // Если уже есть активная подписка — продляем, иначе создаём новую
  var sub models.Subscription
  if err := database.DB.
      Where("user_id = ? AND expires_at > ?", userID, now).
      First(&sub).Error; err == nil {
    sub.ExpiresAt = expires
    database.DB.Save(&sub)
  } else {
    sub = models.Subscription{UserID: userID, ExpiresAt: expires}
    database.DB.Create(&sub)
  }

  c.JSON(http.StatusOK, gin.H{"expires_at": sub.ExpiresAt})
}
