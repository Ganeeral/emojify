package main

import (
	"context"
	"log"
	"time"

	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/handlers"
	"github.com/Ganeeral/emojify-ai/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v4/pgxpool"
)

func main() {
    
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

    }

	r.POST("/register", handlers.RegisterUser)
	r.POST("/login", handlers.Login)
    r.POST("/analyze", handlers.AnalyzeScene)

	r.Run(":8080")
}
