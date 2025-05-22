"use client";

import React, { useState, useEffect } from "react";
import ResultSection from "../ResultSection/resultSection";
import Loader from "@/components/Loader/loader";

const DemoSection = () => {
  const [scene, setScene] = useState("");
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleGenerateMore = () => {
    setScene(""); // Очищаем инпут
    setEmotion(""); // Сбрасываем эмоцию
    setShowForm(true); // Показываем форму
    setShowResult(false); // Скрываем результат
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setShowForm(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowForm(false);
    setShowResult(false);

    try {
      const response = await fetch(
        "https://emojify-backend.cloudpub.ru/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: 1, scene }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error from server:", errorData);
        return;
      }

      const data = await response.json();
      setEmotion(data.emotion);
    } catch {
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  return (
    <div className="flex justify-center items-center w-full flex-col h-full">
      <div
        className={`transition-opacity duration-500 ${
          loading ? "opacity-100" : "opacity-0"
        } ${loading ? "block" : "hidden"}`}
      >
        <Loader />
      </div>

      <div
        className={`transition-opacity w-full flex justify-center flex-col items-center duration-500 ${
          !loading && showForm ? "opacity-100" : "opacity-0"
        } ${!loading && showForm ? "block" : "hidden"}`}
      >
        <h4 className="clamp-text Inter font-bold">
          Попробуй <span className="gradientText">Анимоджи</span>
        </h4>
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-[#312E2F] max-w-[1100px] mt-24 rounded-3xl w-full"
        >
          <input
            className="placeholder text-xl text-[#AFAFAF] max-w-[1100px] rounded-3xl px-8 py-6 w-full placeholder:text-xl Inter font-bold bg-inherit outline-none"
            type="text"
            placeholder="Введите сцену..."
            value={scene}
            onChange={(e) => setScene(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#171717] px-7 py-6 z-10 rounded-3xl"
          >
            <p className="gradientText text-[22px] Inter font-bold">Анимоджи</p>
          </button>
        </form>
      </div>

      <div
        className={`transition-opacity duration-700 mt-8 text-xl text-white ${
          !loading && showResult && emotion ? "opacity-100" : "opacity-0"
        } ${!loading && showResult && emotion ? "block" : "hidden"}`}
      >
        <ResultSection emotion={emotion} onGenerateMore={handleGenerateMore} />
      </div>
    </div>
  );
};

export default DemoSection;
