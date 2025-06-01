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
  } catch {
    res.status(500).json({ error: "Failed to analyze scene" });
  }
});

app.listen(5000, () => {
  console.log("AI Server running on port 5000");
});
