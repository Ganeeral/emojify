const { OpenAI } = require("openai");
// const { createDeepSeek } = require("@ai-sdk/deepseek");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey:
    "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",
  // defaultHeaders: {
  //   'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
  //   'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  // },
});

app.post("/analyze", async (req, res) => {
  const { scene } = req.body;

  try {
    const prompt = `
    Ты — классификатор эмоций. Определи эмоцию сцены ОДНИМ СЛОВОМ из строго заданного списка:
    радость, грусть, гнев, удивление, страх, отвращение, спокойствие, любовь, скука, разочарование, смущение, раздражение, восхищение, сожаление, благодарность, злость, тоска, обида, уверенность, усталость.

    Если текст не содержит четкой эмоции или эмоция не может быть однозначно определена, ответь: "некорректный запрос".

    НЕ добавляй пояснений, объяснений или других слов. Только одно слово из списка.

    Сцена: ${scene}
`;

    const result = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-8b-instruct:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiResponse = result.choices[0].message.content.trim();

    res.json({ emotion: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze scene" });
  }
});

app.listen(5000, () => {
  console.log("AI Server running on port 5000");
});
