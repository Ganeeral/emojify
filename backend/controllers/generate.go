package controllers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"net/textproto"

	"github.com/Ganeeral/emojify-ai/database"
	"github.com/Ganeeral/emojify-ai/models"
	"github.com/gin-gonic/gin"
)

////////////////////////////////////////////////////////////
// 1) Структуры запросов/ответов
////////////////////////////////////////////////////////////

// GenerateImageRequest — тело POST /generate-image
type GenerateImageRequest struct {
	Text   string `json:"text" binding:"required"`
	Width  int    `json:"width" binding:"required"`
	Height int    `json:"height" binding:"required"`
	Style  string `json:"style"`
	UserID int    `json:"user_id" binding:"required"`
}

// FusionResponse — ответ FusionBrain при запуске пайплайна
type FusionResponse struct {
	Uuid string `json:"uuid"`
}

// ImageStatusResponse — ответ клиенту при GET /image-status
type ImageStatusResponse struct {
	Status   string `json:"status"`
	ImageURL string `json:"image_url,omitempty"`
}

////////////////////////////////////////////////////////////
// 2) Генерация изображения (асинхронно)
////////////////////////////////////////////////////////////

func GenerateImageAsync(c *gin.Context) {
    var req GenerateImageRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса: " + err.Error()})
        return
    }

    userID := req.UserID
    now := time.Now()

    // ── 0) Проверяем активную подписку ───────────────────────────────────────
    var sub models.Subscription
    subErr := database.DB.
        Where("user_id = ? AND expires_at > ?", userID, now).
        First(&sub).Error

    if subErr != nil {
        // Нет активной подписки — считаем сегодня сделанные запросы
        startOfDay := time.Date(
            now.Year(), now.Month(), now.Day(),
            0, 0, 0, 0, now.Location(),
        )

        var usedToday int64
        database.DB.
            Model(&models.GeneratedImage{}).
            Where("user_id = ? AND created_at >= ?", userID, startOfDay).
            Count(&usedToday)

        if usedToday >= 1 {
            c.JSON(http.StatusForbidden, gin.H{"error": "Дневной лимит бесплатной генерации (1 раз) исчерпан. Купите премиум-подписку."})
            return
        }
    }

    // ── 1) Формируем payload для FusionBrain ─────────────────────────────────
    payload := &bytes.Buffer{}
    writer := multipart.NewWriter(payload)

    // Достаём pipeline_id
    pipelineID := getPipelineID(os.Getenv("FUSION_API_KEY"), os.Getenv("FUSION_SECRET_KEY"))
    _ = writeFormField(writer, "pipeline_id", pipelineID, "text/plain")

    // Параметры генерации
    params := map[string]interface{}{
        "type":         "GENERATE",
        "numImages":    1,
        "width":        req.Width,
        "height":       req.Height,
        "generateParams": map[string]string{"query": req.Text},
    }
    if req.Style != "" {
        params["style"] = req.Style
    }
    paramsJSON, _ := json.Marshal(params)
    _ = writeFormField(writer, "params", string(paramsJSON), "application/json")
    _ = writer.Close()

    // ── 2) POST к FusionBrain ────────────────────────────────────────────────
    apiKey := os.Getenv("FUSION_API_KEY")
    secretKey := os.Getenv("FUSION_SECRET_KEY")
    reqFusion, err := http.NewRequest("POST",
        "https://api-key.fusionbrain.ai/key/api/v1/pipeline/run",
        payload,
    )
    if err != nil {
        log.Println("Ошибка формирования запроса к FusionBrain:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сформировать запрос к FusionBrain"})
        return
    }
    reqFusion.Header.Set("X-Key", "Key "+apiKey)
    reqFusion.Header.Set("X-Secret", "Secret "+secretKey)
    reqFusion.Header.Set("Content-Type", writer.FormDataContentType())

    resp, err := (&http.Client{}).Do(reqFusion)
    if err != nil {
        log.Println("Ошибка при отправке запроса в FusionBrain:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при общении с FusionBrain"})
        return
    }
    defer resp.Body.Close()

    respBody, _ := io.ReadAll(resp.Body)
    if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
        log.Printf("FusionBrain вернул %d: %s\n", resp.StatusCode, string(respBody))
        var errMap map[string]interface{}
        if json.Unmarshal(respBody, &errMap) == nil {
            c.JSON(resp.StatusCode, errMap)
        } else {
            c.JSON(resp.StatusCode, gin.H{"error": string(respBody)})
        }
        return
    }

    // ── 3) Берём UUID из ответа ──────────────────────────────────────────────
    var fusionResp FusionResponse
    if err := json.Unmarshal(respBody, &fusionResp); err != nil {
        log.Println("Ошибка парсинга ответа FusionBrain:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка парсинга ответа FusionBrain"})
        return
    }

    // ── 4) Сохраняем запись с PENDING ────────────────────────────────────────
    record := models.GeneratedImage{
        UserID:   userID,
        Query:    req.Text,
        Style:    req.Style,
        Width:    req.Width,
        Height:   req.Height,
        UUID:     fusionResp.Uuid,
        Status:   "PENDING",
        ImageB64: "",
    }
    if err := database.DB.Create(&record).Error; err != nil {
        log.Println("Ошибка сохранения GeneratedImage:", err)
    }

    // ── 5) Отдаём UUID клиенту ───────────────────────────────────────────────
    c.JSON(http.StatusOK, gin.H{"uuid": fusionResp.Uuid})
}


////////////////////////////////////////////////////////////
// 3) Проверка статуса генерации (GET /image-status?uuid=...)
////////////////////////////////////////////////////////////

// … (весь остальной код остаётся без изменений) …

func GetImageStatus(c *gin.Context) {
	uuid := c.Query("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "параметр uuid обязателен"})
		return
	}

	// 1) Получаем запись из БД
	var record models.GeneratedImage
	if err := database.DB.Where("uuid = ?", uuid).First(&record).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Запись не найдена"})
		return
	}

	// 2) Запрос к FusionBrain, чтобы узнать статус
	apiKey := os.Getenv("FUSION_API_KEY")
	secretKey := os.Getenv("FUSION_SECRET_KEY")
	if apiKey == "" || secretKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "API ключи не заданы"})
		return
	}
	statusURL := "https://api-key.fusionbrain.ai/key/api/v1/pipeline/status/" + uuid
	fReq, _ := http.NewRequest("GET", statusURL, nil)
	fReq.Header.Set("X-Key", "Key "+apiKey)
	fReq.Header.Set("X-Secret", "Secret "+secretKey)

	client := &http.Client{}
	fResp, err := client.Do(fReq)
	if err != nil {
		log.Println("GetImageStatus: ошибка при запросе статуса:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить статус"})
		return
	}
	defer fResp.Body.Close()

	body, _ := io.ReadAll(fResp.Body)
	if fResp.StatusCode != http.StatusOK {
		log.Printf("GetImageStatus: FusionBrain вернул %d: %s\n", fResp.StatusCode, string(body))
		c.JSON(fResp.StatusCode, gin.H{"error": string(body)})
		return
	}

	// 3) Парсим JSON-ответ
	var parsed map[string]interface{}
	if err := json.Unmarshal(body, &parsed); err != nil {
		log.Println("GetImageStatus: ошибка парсинга JSON:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка разбора ответа FusionBrain"})
		return
	}

	// 4) Достаём статус
	statusRaw, ok := parsed["status"]
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Нет поля status в ответе"})
		return
	}
	status, _ := statusRaw.(string)
	log.Printf("GetImageStatus: FusionBrain вернул status = \"%s\" для uuid = %s\n", status, uuid)

	// 5) Определим, завершена ли генерация (пример: содержит «DONE» или «SUCCESS»)
	lower := strings.ToLower(status)
	finished := strings.Contains(lower, "done") || strings.Contains(lower, "succeed") || strings.Contains(lower, "success")

	// 6) Если «финальный» статус, получаем imageURL (либо Base64, либо настоящий URL)
	var imageURL string
	if finished {
		if resultIface, exists := parsed["result"].(map[string]interface{}); exists {
			if filesIface, ok2 := resultIface["files"].([]interface{}); ok2 && len(filesIface) > 0 {
				if urlStr, ok3 := filesIface[0].(string); ok3 {
					imageURL = urlStr
				}
			}
		}
	}

	// 7) Если получили какой-то imageURL (который может быть Base64 или настоящий URL),
	//    пробуем различить и загрузить по-разному:
	if finished && record.Status != "DONE" && imageURL != "" {
		if strings.HasPrefix(imageURL, "data:") && strings.Contains(imageURL, "base64,") {
			// вариант: imageURL = "data:image/png;base64,AAAA..."
			parts := strings.SplitN(imageURL, "base64,", 2)
			if len(parts) == 2 {
				// Берём то, что после "base64,"
				rawB64 := parts[1]
				imgBytes, err := base64.StdEncoding.DecodeString(rawB64)
				if err != nil {
					log.Println("GetImageStatus: ошибка декодирования Base64:", err)
					record.Status = "FAILED"
					database.DB.Save(&record)
				} else {
					record.Status = "DONE"
					record.ImageBytes = imgBytes
					// (опционально) сразу заполняем поле ImageB64, если нужно
					record.ImageB64 = rawB64
					if errUpd := database.DB.Save(&record).Error; errUpd != nil {
						log.Println("GetImageStatus: не удалось сохранить Base64 в БД:", errUpd)
					} else {
						log.Printf("GetImageStatus: запись с uuid=%s обновлена (Status=DONE), байты сохранены из data URI\n", uuid)
					}
				}
			}
		} else if !strings.HasPrefix(imageURL, "http://") && !strings.HasPrefix(imageURL, "https://") {
			// вариант: imageURL это просто чистый Base64 (без "data:image...")
			rawB64 := imageURL
			imgBytes, err := base64.StdEncoding.DecodeString(rawB64)
			if err != nil {
				log.Println("GetImageStatus: ошибка декодирования «сырой» Base64:", err)
				record.Status = "FAILED"
				database.DB.Save(&record)
			} else {
				record.Status = "DONE"
				record.ImageBytes = imgBytes
				record.ImageB64 = rawB64
				if errUpd := database.DB.Save(&record).Error; errUpd != nil {
					log.Println("GetImageStatus: не удалось сохранить Base64 в БД:", errUpd)
				} else {
					log.Printf("GetImageStatus: запись с uuid=%s обновлена (Status=DONE), байты сохранены из raw Base64\n", uuid)
				}
			}
		} else {
			// вариант: imageURL — настоящий URL, качаем через http.Get
			log.Printf("GetImageStatus: статус \"%s\" → скачиваем картинку по URL = %s\n", status, imageURL)
			respImg, errImg := http.Get(imageURL)
			if errImg != nil {
				log.Println("GetImageStatus: не удалось скачать изображение:", errImg)
				record.Status = "FAILED"
				database.DB.Save(&record)
			} else {
				defer respImg.Body.Close()
				imgBytes, _ := io.ReadAll(respImg.Body)
				record.Status = "DONE"
				record.ImageBytes = imgBytes
				// (опционально) сохраняем Base64, если хотите хранить
				record.ImageB64 = base64.StdEncoding.EncodeToString(imgBytes)
				if errUpd := database.DB.Save(&record).Error; errUpd != nil {
					log.Println("GetImageStatus: не удалось сохранить скачанное изображение в БД:", errUpd)
				} else {
					log.Printf("GetImageStatus: запись с uuid=%s обновлена (Status=DONE), байты сохранены из URL\n", uuid)
				}
			}
		}
	} else if !finished {
		// Если ещё не финальный статус, но он поменялся, обновляем только record.Status
		if record.Status != status {
			record.Status = status
			if errUpd := database.DB.Save(&record).Error; errUpd != nil {
				log.Println("GetImageStatus: ошибка обновления статуса в БД:", errUpd)
			} else {
				log.Printf("GetImageStatus: запись c uuid=%s обновлена, status=\"%s\"\n", uuid, status)
			}
		}
	}

	// 8) Возвращаем клиенту текущий статус и (если есть) imageURL
	c.JSON(http.StatusOK, ImageStatusResponse{
		Status:   status,
		ImageURL: imageURL,
	})
}

////////////////////////////////////////////////////////////
// 4) Получение всех сохранённых изображений по user_id (GET /saved-images?user_id=...)
////////////////////////////////////////////////////////////

func GetSavedImages(c *gin.Context) {
	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "параметр user_id обязателен"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный формат user_id"})
		return
	}

	var images []models.GeneratedImage
	if err := database.DB.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&images).Error; err != nil {
		log.Println("Ошибка при получении записей из БД:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить сохранённые изображения"})
		return
	}

	// Возвращаем список записей. Поле ImageB64 будет содержать base64-строку, если статус = DONE.
	c.JSON(http.StatusOK, images)
}

////////////////////////////////////////////////////////////
// 5) Вспомогательные функции для работы с multipart/form-data и FusionBrain
////////////////////////////////////////////////////////////

// writeFormField добавляет в multipart.Writer одно поле с указанным contentType.
func writeFormField(writer *multipart.Writer, name, value, contentType string) error {
	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", `form-data; name="`+name+`"`)
	h.Set("Content-Type", contentType)
	part, err := writer.CreatePart(h)
	if err != nil {
		return err
	}
	_, err = part.Write([]byte(value))
	return err
}

// getPipelineID запрашивает список pipeline'ов у FusionBrain и возвращает id первого.
// Если что-то пойдёт не так—вызываем log.Fatalf, т. к. без pipeline_id дальнейшая генерация невозможна.
func getPipelineID(apiKey, secretKey string) string {
	req, err := http.NewRequest("GET", "https://api-key.fusionbrain.ai/key/api/v1/pipelines", nil)
	if err != nil {
		log.Fatalf("Не удалось создать запрос для получения pipeline_id: %v", err)
	}
	req.Header.Set("X-Key", "Key "+apiKey)
	req.Header.Set("X-Secret", "Secret "+secretKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Не удалось получить список pipeline'ов от FusionBrain: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		log.Fatalf("FusionBrain вернул статус %d при запросе pipeline_id: %s", resp.StatusCode, string(body))
	}

	var data []map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		log.Fatalf("Не удалось распарсить ответ с pipeline'ами: %v", err)
	}
	if len(data) == 0 {
		log.Fatalf("Не найдено ни одного pipeline в FusionBrain")
	}

	// Предполагаем, что поле "id" всегда строка
	if idVal, ok := data[0]["id"].(string); ok {
		return idVal
	}
	log.Fatalf("Unexpected format: pipeline ID is not a string")
	return ""
}
