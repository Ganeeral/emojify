"use client";

import React, { useState, useEffect } from "react";
import ResultSection from "../ResultSection/resultSection";
import Loader from "@/components/Loader/loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadIcon } from "@/ui/icons";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ImageOptionsModal from "@/components/ImageOptionsModal/ImageOptionsModal";
import SettingsIcon from "@/ui/icons/SettingsIcon.svg";

const DemoSection = () => {
  const [scene, setScene] = useState("");
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [mode, setMode] = useState<"animation" | "image">("animation");
  const [imageURL, setImageURL] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgWidth, setImgWidth] = useState<number>(1024);
  const [imgHeight, setImgHeight] = useState<number>(1024);
  const [imgStyle, setImgStyle] = useState<string>("DEFAULT");
  const [error, setError] = useState(false);

  const handleGenerateMore = () => {
    setScene("");
    setEmotion("");
    setImageURL("");
    setShowForm(true);
    setShowResult(false);
    setError(false);
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
    setError(false);

    try {
      let response;
      if (mode === "animation") {
        response = await fetch("https://emojify-backend.cloudpub.ru/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1, scene }),
        });
        if (!response.ok) throw new Error("Ошибка анализа");
        const data = await response.json();
        setEmotion(data.emotion);
        setShowResult(true);
      } else {
        response = await fetch(
          "https://emojify-backend.cloudpub.ru/generate-image",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: scene,
              width: imgWidth,
              height: imgHeight,
              style: imgStyle,
              user_id: 1,
            }),
          }
        );
        if (!response.ok) throw new Error("Ошибка генерации изображения");
        const { uuid } = await response.json();

        let attempts = 0;
        let status = "PENDING";
        let imageUrl = "";

        while (attempts < 20 && status !== "DONE") {
          await new Promise((res) => setTimeout(res, 3000));
          const statusResp = await fetch(
            `https://emojify-backend.cloudpub.ru/image-status?uuid=${uuid}`
          );
          const statusData = await statusResp.json();
          status = statusData.status;
          if (status === "DONE") {
            imageUrl = statusData.image_url;
            break;
          }
          attempts++;
        }

        if (!imageUrl) throw new Error("Изображение не готово");
        setImageURL(imageUrl);
        setShowResult(true);
      }
    } catch {
      toast.error(
        "Дневной лимит бесплатной генерации исчерпан. Купите премиум-подписку."
      );
      setError(true);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full flex-col h-full">
      {loading && (
        <div className="transition-opacity duration-500 opacity-100 block">
          <Loader />
        </div>
      )}

      {!loading && showForm && (
        <div className="transition-opacity w-full flex justify-center px-2 flex-col items-center duration-500 opacity-100 block">
          <h4 className="clamp-text Inter font-bold">
            Попробуй <span className="gradientText">Анимоджи</span>
          </h4>

          {/* 🔀 Toggle */}
          <div className="flex items-center justify-center mt-6">
            <div className="relative flex gap-4 bg-[#1A1A1A] p-2 rounded-[999px]">
              <motion.div
                layout
                layoutId="toggleBackground"
                transition={{ type: "spring", stiffness: 400, damping: 50 }}
                className="absolute top-2 bottom-2 left-0 w-1/2 rounded-[999px] gradientBG z-0"
                style={{
                  left: mode === "animation" ? "8px" : "calc(50%",
                  width: "calc(50% - 8px)",
                }}
              />

              <button
                onClick={() => setMode("animation")}
                className={`relative z-10 px-6 py-2 rounded-[999px] Inter font-bold text-[10px]  mobile:text-[14px] text-nowrap transition-colors duration-300 ${
                  mode === "animation" ? "text-[#1A1A1A]" : "text-[#AFAFAF]"
                }`}
              >
                Генерация эмоции
              </button>
              <button
                onClick={() => setMode("image")}
                className={`relative z-10 px-6 py-2 rounded-[999px] text-[10px] text-nowrap Inter mobile:text-[14px] font-bold transition-colors duration-300 ${
                  mode === "image" ? "text-[#1A1A1A]" : "text-[#AFAFAF]"
                }`}
              >
                Генерация картинки
              </button>
            </div>

            <AnimatePresence>
              {mode === "image" && (
                <motion.div
                  className="flex justify-center ml-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded"
                  >
                    <SettingsIcon />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🎯 Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-[#312E2F] max-w-[1100px] mt-10 rounded-3xl w-full"
          >
            <input
              className="placeholder text-xl text-[#AFAFAF] rounded-3xl px-8 py-4 mobile:py-6 w-full Inter font-bold bg-inherit outline-none"
              type="text"
              placeholder="Введите сцену..."
              value={scene}
              required
              onChange={(e) => setScene(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#171717] px-7 py-4 mobile:py-6 z-10 rounded-3xl"
            >
              <p className="gradientText text-[22px] Inter font-semibold">
                Анимоджи
              </p>
            </button>
          </form>

          {error && (
            <div className="mt-6 flex flex-col items-center">
              <p className="text-red-600 Inter font-semibold text-center">
                Дневной лимит бесплатной генерации исчерпан.
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && showResult && (
        <div className="transition-opacity duration-700 mt-8 text-xl text-white opacity-100 block px-2">
          {mode === "animation" ? (
            <ResultSection
              emotion={emotion}
              onGenerateMore={handleGenerateMore}
            />
          ) : (
            <div className="flex flex-col gap-8 items-center">
              <Image
                src={`data:image/jpeg;base64,${imageURL}`}
                alt="Сгенерированное изображение"
                className="rounded-xl max-w-[420px] max-h-[420px] object-cover cursor-pointer"
                width={1920}
                height={1080}
                quality={100}
                onClick={() => setIsOpen(true)}
              />

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.img
                      src={`data:image/jpeg;base64,${imageURL}`}
                      alt="Увеличенное изображение"
                      className="rounded-2xl max-w-[90vw] max-h-[90vh] shadow-2xl cursor-default"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-center items-center gap-x-3">
                <button
                  onClick={handleGenerateMore}
                  className="px-14 py-[18px] bg-[#1A1A1A] rounded-xl text-2xl text-[#BEBEBE] Inter font-bold"
                >
                  Сгенерировать еще?
                </button>
                <a
                  href={`data:image/jpeg;base64,${imageURL}`}
                  download={`${scene}.jpg`}
                  className="px-6 py-6 rounded-xl bg-[#1A1A1A] cursor-pointer"
                >
                  <LoadIcon />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={1000} theme="dark" />
      <ImageOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialWidth={imgWidth}
        initialHeight={imgHeight}
        initialStyle={imgStyle}
        onSave={({ width, height, style }) => {
          setImgWidth(width);
          setImgHeight(height);
          setImgStyle(style);
        }}
      />
    </div>
  );
};

export default DemoSection;
