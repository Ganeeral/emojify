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
  const [error, setError] = useState(false);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handleGenerateMore = () => {
    setScene("");
    setEmotion("");
    setImageURL("");
    setShowForm(true);
    setShowResult(false);
    setError(false);
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
    setError(false);

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
        setShowResult(true);
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
        setShowResult(true);
      }
    } catch {
      toast.error(
        "Дневной лимит бесплатной генерации исчерпан. Купите премиум-подписку."
      );
      setError(true);
      setShowForm(true);
      // setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (days: number) => {
    if (purchasing) return;
    setPurchasing(true);
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        "https://emojify-backend.cloudpub.ru/purchase-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ days }),
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(
        `Премиум активирован до ${new Date(
          data.expires_at
        ).toLocaleDateString()}`
      );
      setIsSubModalOpen(false);
      setError(false);
    } catch {
      toast.error("Не удалось оформить подписку");
    } finally {
      setPurchasing(false);
    }
  };

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
              <div className="relative flex gap-4 bg-[#1A1A1A] p-2 rounded-[999px]">
                {/* Animated background toggle indicator */}
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
                  className={`relative z-10 px-6 py-2 rounded-[999px] Inter font-bold text-[10px] text-nowrap mobile:text-[14px] transition-colors duration-300 ${
                    mode === "animation" ? "text-[#1A1A1A]" : "text-[#AFAFAF]"
                  }`}
                >
                  Генерация эмоции
                </button>
                <button
                  onClick={() => setMode("image")}
                  className={`relative z-10 px-6 py-2 rounded-[999px] text-[10px] text-nowrap Inter font-bold mobile:text-[14px] transition-colors duration-300 ${
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
                <button
                  onClick={() => setIsSubModalOpen(true)}
                  className="mt-4 bg-[#171717] px-6 py-4 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <span className="gradientText text-[16px] Inter font-bold">
                    Купить подписку
                  </span>
                </button>
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
                <div className="flex justify-center items-center"></div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSubModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* бэкдроп с блюром */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSubModalOpen(false)}
            />

            {/* контент модалки */}
            <motion.div
              className="relative bg-[#0D0D0D] rounded-2xl p-8 max-w-sm w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-2xl Inter font-bold mb-4 text-center text-[#B0B0B0]">
                Выберите подписку
              </h3>
              <div className="flex flex-col gap-3">
                {[1, 7, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => handlePurchase(d)}
                    disabled={purchasing}
                    className="w-full Inter font-semibold py-3 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] transition-colors"
                  >
                    {d === 1 ? "1 день" : `${d} дней`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="absolute top-3 right-3 text-[#626262] hover:text-[#AFAFAF] transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
