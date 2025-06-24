package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/models"
	"gorm.io/gorm"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

var db *gorm.DB
var adminChatID int64

func main() {
	// Подключение к базе
	database.ConnectDB()
	db = database.DB

	// Получение токена и chat_id админа
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	adminIDStr := os.Getenv("TELEGRAM_ADMIN_CHAT_ID")
	id, err := strconv.ParseInt(adminIDStr, 10, 64)
	if err != nil {
		log.Fatalf("Неверный TELEGRAM_ADMIN_CHAT_ID: %v", err)
	}
	adminChatID = id

	// Инициализация бота
	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		log.Fatalf("Ошибка запуска бота: %v", err)
	}
	bot.Debug = false

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 30
	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message == nil || !update.Message.IsCommand() {
			continue
		}

		// Проверка прав доступа
		if update.Message.Chat.ID != adminChatID {
			bot.Send(tgbotapi.NewMessage(update.Message.Chat.ID, "⛔ У вас нет доступа."))
			continue
		}

		switch update.Message.Command() {
		case "subscribers":
			handleSubscribers(bot, update.Message.Chat.ID)
		case "revenue":
			handleRevenue(bot, update.Message.Chat.ID)
		default:
			bot.Send(tgbotapi.NewMessage(update.Message.Chat.ID, "Неизвестная команда."))
		}
	}
}

func handleSubscribers(bot *tgbotapi.BotAPI, chatID int64) {
	now := time.Now()
	var subs []models.Subscription
	err := db.Where("expires_at > ?", now).Order("created_at desc").Find(&subs).Error
	if err != nil {
		bot.Send(tgbotapi.NewMessage(chatID, "Ошибка при получении подписчиков"))
		return
	}

	if len(subs) == 0 {
		bot.Send(tgbotapi.NewMessage(chatID, "Нет активных подписок"))
		return
	}

	text := "💳 Активные подписчики:\n\n"
	for _, s := range subs {
		var user models.User
		if err := db.First(&user, s.UserID).Error; err == nil {
			text += fmt.Sprintf("👤 %s (%s)\n📅 До: %s\n\n", user.Name, user.Email, s.ExpiresAt.Format("02.01.2006"))
		}
	}

	bot.Send(tgbotapi.NewMessage(chatID, text))
}

func handleRevenue(bot *tgbotapi.BotAPI, chatID int64) {
	var subs []models.Subscription
	if err := db.Find(&subs).Error; err != nil {
		bot.Send(tgbotapi.NewMessage(chatID, "Ошибка при подсчёте выручки"))
		return
	}

	total := 0
	for _, s := range subs {
		days := int(s.ExpiresAt.Sub(s.CreatedAt).Hours() / 24)
		switch days {
		case 1:
			total += 35
		case 7:
			total += 120
		case 30:
			total += 299
		default:
			total += days
		}
	}

	bot.Send(tgbotapi.NewMessage(chatID, fmt.Sprintf("💰 Общая выручка: %d ₽", total)))
}
