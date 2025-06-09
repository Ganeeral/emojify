package main

import (
	"context"
	"log"
	"time"

	"github.com/Ganeeral/emojify-ai/controllers"
	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/handlers"
	"github.com/Ganeeral/emojify-ai/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("Нет .env файла")
	}

	connString := "postgresql://postgres:0897187526@localhost:5432/postgres"
	db, err := pgxpool.Connect(context.Background(), connString)
	if err != nil {
		log.Fatalf("Не удалось подключиться к базе данных: %v", err)
	}
	defer db.Close()

	// Передача подключения обработчику
	handlers.SetDB(db)

	database.ConnectDB()

	r := gin.Default()
	auth := r.Group("/")

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	auth.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/profile", handlers.GetProfile)
		auth.GET("/scenes", handlers.GetProfileScenes)
		auth.PUT("/edit", handlers.UpdateProfile)
		auth.POST("/purchase-subscription", handlers.PurchaseSubscription)

	}

	r.POST("/register", handlers.RegisterUser)
	r.POST("/login", handlers.Login)
	r.POST("/analyze", handlers.AnalyzeScene)
	r.POST("/generate-image", controllers.GenerateImageAsync)
	r.GET("/image-status", controllers.GetImageStatus)
	r.GET("/saved-images", controllers.GetSavedImages)

	r.Run(":8080")
}
