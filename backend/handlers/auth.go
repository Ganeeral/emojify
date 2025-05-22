package handlers

import (
	"net/http"
	"time"

	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Секретный ключ для подписи JWT
var jwtSecret = []byte("dmccf4a/T5M4IXqMtKry0I9S5xFgNTrPXuYasP45dPg=")

// Структура для входных данных
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Структура для JWT Claims
type Claims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

// Обработчик для входа
func Login(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	// Генерация JWT токена
	accessToken, err := generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать токен"})
		return
	}

	// Декодируем токен для отладки
	parsedToken, _, _ := new(jwt.Parser).ParseUnverified(accessToken, jwt.MapClaims{})

	c.JSON(http.StatusOK, gin.H{
		"message":          "Вход выполнен успешно",
		"token":            accessToken,
		"token_data":       parsedToken.Claims,
		"user":             user,
	})
}

// Функция для генерации JWT токена
func generateJWT(userID uint) (string, error) {
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
