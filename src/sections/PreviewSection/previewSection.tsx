"use client";

import React from "react";
import ButtonToEmojify from "@/components/Buttons/buttonToEmojify";

const PreviewSection = () => {
  return (
    <div className="flex flex-col justify-center h-full items-center">
      <div className="flex flex-col gap-y-6 justify-center items-center h-full">
        <h2 className="clamp-title w-full leading-none poin Inter font-bold">
          <span className="text-yellow">
            Добро пожаловать <br /> в мир
            <br />
          </span>{" "}
          <span className="gradientText">Анимоджи</span>
        </h2>
        <ButtonToEmojify />
      </div>
    </div>
  );
};

export default PreviewSection;
