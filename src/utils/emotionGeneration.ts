const emotionImageMap: Record<string, string> = {
  радость: "/joy.webp",
  грусть: "/sadness.webp",
  гнев: "/anger.webp",
  удивление: "/surprises.webp",
  страх: "/fear.webp",
  отвращение: "/disgust.webp",
  спокойствие: "/calm.webp",
  любовь: "/love.webp",
  скука: "/boredom.webp",
  разочарование: "/disappointment.webp",
  смущение: "/embarrassment.webp",
  раздражение: "/irritation.webp",
  восхищение: "/admiration.webp",
  сожаление: "/regret.webp",
  благодарность: "/gratitude.webp",
  злость: "/rage.webp",
  тоска: "/longing.webp",
  обида: "/resentment.webp",
  уверенность: "/confidence.webp",
  усталость: "/tiredness.webp",
  default: "/neutral.webp",
};

export const getImageForEmotion = (emotion: string): string => {
  return emotionImageMap[emotion.toLowerCase()] || emotionImageMap.default;
};
