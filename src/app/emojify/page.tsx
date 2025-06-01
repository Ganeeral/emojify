"use client";

import React, { useState, useEffect } from "react";
import ResultSection from "@/sections/ResultSection/resultSection";
import HeaderAuth from "@/components/HeaderAuth/headerAuth";
import Loader from "@/components/Loader/loader";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadIcon } from "@/ui/icons";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ImageOptionsModal from "@/components/ImageOptionsModal/ImageOptionsModal";
import SettingsIcon from "@/ui/icons/SettingsIcon.svg";

const Page = () => {
  const [scene, setScene] = useState("");
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [mode, setMode] = useState<"animation" | "image">("animation");
  const [imageURL, setImageURL] = useState("");
  const { push } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgWidth, setImgWidth] = useState<number>(1024);
  const [imgHeight, setImgHeight] = useState<number>(1024);
  const [imgStyle, setImgStyle] = useState<string>("DEFAULT");

  const handleGenerateMore = () => {
    setScene("");
    setEmotion("");
    setImageURL("");
    setShowForm(true);
    setShowResult(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) push("/");
    setId(Number(localStorage.getItem("id")));
  }, [push]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setShowForm(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id === null) return;

    setLoading(true);
    setShowForm(false);
    setShowResult(false);

    try {
      let response;
      if (mode === "animation") {
        response = await fetch("https://emojify-backend.cloudpub.ru/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: id, scene }),
        });
        if (!response.ok) throw new Error("Ошибка анализа");
        const data = await response.json();
        setEmotion(data.emotion);
      } else {
        // response = await fetch(
        //   "https://emojify-backend.cloudpub.ru/generate-image",
        //   {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ text: scene }),
        //   }
        // );
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
              user_id: id,
            }),
          }
        );
        if (!response.ok) throw new Error("Ошибка генерации изображения");
        const { uuid } = await response.json();

        let attempts = 0;
        let status = "PENDING";
        let imageUrl = "";

        while (attempts < 20 && status !== "DONE") {
          await new Promise((res) => setTimeout(res, 3000)); // 3 сек
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
      }
    } catch {
      toast.error("Произошла ошибка! Попробуйте снова.");
      setShowForm(true);
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  console.log(scene);

  return (
    <main className="h-full">
      <HeaderAuth />
      <div className="flex justify-center items-center w-full flex-col h-[70dvh]">
        {loading && (
          <div className="transition-opacity duration-500 opacity-100 block">
            <Loader />
          </div>
        )}

        {!loading && showForm && (
          <div className="transition-opacity w-full flex justify-center px-2 flex-col items-center duration-500 opacity-100 block">
            <h4 className="clamp-text Inter font-bold">
              <span className="gradientText">Анимоджи</span>
            </h4>

            {/* 🔀 Toggle */}
            <div className="flex items-center justify-center mt-6">
              <div className="flex  gap-4 bg-[#1A1A1A] p-2 rounded-[999px]">
                <button
                  onClick={() => setMode("animation")}
                  className={`px-6 py-2 rounded-[999px] font-bold ${
                    mode === "animation"
                      ? "gradientBG text-[#1A1A1A] Inter font-bold"
                      : "text-[#AFAFAF] Inter font-bold"
                  }`}
                >
                  Генерация эмоции
                </button>
                <button
                  onClick={() => setMode("image")}
                  className={`px-6 py-2 rounded-[999px] font-bold ${
                    mode === "image"
                      ? "gradientBG text-[#1A1A1A] Inter font-bold"
                      : "text-[#AFAFAF] Inter font-bold"
                  }`}
                >
                  Генерация картинки
                </button>
              </div>
              {mode === "image" && (
                <div className=" flex justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded"
                  >
                    <SettingsIcon />
                  </button>
                </div>
              )}
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
                <p className="gradientText text-[22px]">Emojify</p>
              </button>
            </form>
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
                <div className="flex justify-center items-center"></div>
              </div>
            )}
          </div>
        )}
      </div>
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
    </main>
  );
};

export default Page;
