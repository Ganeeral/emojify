package utils

import (
	"log"
	"net/http"
	"net/url"
	"os"
	"io"
)

func NotifyAdmin(message string) {
    botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
    chatID := os.Getenv("TELEGRAM_ADMIN_CHAT_ID")
    
    if botToken == "" || chatID == "" {
        log.Println("TELEGRAM_BOT_TOKEN или TELEGRAM_ADMIN_CHAT_ID не установлены")
        return
    }

    apiURL := "https://api.telegram.org/bot" + botToken + "/sendMessage"
    data := url.Values{
        "chat_id": {chatID},
        "text":    {message},
    }

    resp, err := http.PostForm(apiURL, data)
    if err != nil {
        log.Printf("Ошибка отправки в Telegram: %v", err)
        return
    }
    defer resp.Body.Close()

    // Чтение ответа для диагностики
    body, _ := io.ReadAll(resp.Body)
    if resp.StatusCode != http.StatusOK {
        log.Printf("Telegram API error: %s, Response: %s", resp.Status, body)
    }
}
