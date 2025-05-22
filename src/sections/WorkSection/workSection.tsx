import ButtonToEmojify from "@/components/Buttons/buttonToEmojify";
import React from "react";

const data = [
  {
    id: 1,
    title: "Ввод текста",
    description: "Пользователь вводит текстовое описание.",
  },
  {
    id: 2,
    title: "Анализ эмоции",
    description:
      "Искусственный интеллект определяет, какую эмоцию передает текст.",
  },
  {
    id: 3,
    title: "Отображение анимации",
    description: "Система выводит анимационный эмодзи, соответствующий эмоции.",
  },
];

const WorkSection = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col gap-y-2 ">
        <h3 className="clamp-text Inter font-bold">
          Как работает <span className="gradientText Inter font-semibold">Анимоджи</span>{" "}
          ?
        </h3>
        <p className="Inter font-bold text-[#909DAC] text-base sm:text-xl text-center">
          Простой и быстрый способ визуализировать эмоции, скрытые в тексте.
        </p>
      </div>

      <div className="flex flex-col gap-y-7 justify-center items-center w-full Inter font-bold mt-20">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex gap-x-8 items-center max-w-[891px] px-7 py-3 w-full rounded-xl bg-[#464344]"
          >
            <span className="gradientNumber text-7xl">{item.id}</span>
            <div className="flex flex-col gap-y-3">
              <p className="text-3xl gradientTitle">{item.title}</p>
              <p className="text-[#AFAFAF]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12">
        <ButtonToEmojify />
      </div>
    </div>
  );
};

export default WorkSection;
