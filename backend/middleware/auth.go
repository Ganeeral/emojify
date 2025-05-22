package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Используем тот же секретный ключ, что и в handlers
var jwtSecret = []byte("dmccf4a/T5M4IXqMtKry0I9S5xFgNTrPXuYasP45dPg=")

// Структура для Claims
type Claims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

// Middleware для проверки Access Token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		// Отладка: выводим полученный заголовок
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":          "Токен не найден",
				"provided_token": tokenString,
			})
			c.Abort()
			return
		}

		if !strings.HasPrefix(tokenString, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":          "Неверный формат токена",
				"provided_token": tokenString,
			})
			c.Abort()
			return
		}

		// Убираем "Bearer " префикс
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":          "Токен пустой после обрезки",
				"provided_token": tokenString,
			})
			c.Abort()
			return
		}

		// Парсим токен
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":          "Неверный токен",
				"error_message":  err.Error(),
				"provided_token": tokenString,
			})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}

