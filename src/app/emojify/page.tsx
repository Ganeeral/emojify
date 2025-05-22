"use client";

import React, { useState, useEffect } from "react";
import ResultSection from "@/sections/ResultSection/resultSection";
import HeaderAuth from "@/components/HeaderAuth/headerAuth";
import Loader from "@/components/Loader/loader";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page = () => {
  const [scene, setScene] = useState("");
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [id, setId] = useState<number | null>(null); // Инициализируем как null
  const { push } = useRouter();

  const handleGenerateMore = () => {
    setScene("");
    setEmotion("");
    setShowForm(true);
    setShowResult(false);
  };

  useEffect(() => {
    // Этот код выполняется только на клиенте
    const token = localStorage.getItem("authToken");
    if (!token) {
      push("/");
    }
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
    if (id === null) return; // Проверяем, что id установлен
    
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
          body: JSON.stringify({ user_id: id, scene }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error from server:", errorData);
        toast.error("Произошла ошибка! Попробуйте снова.");
        setShowForm(true);
        return;
      }

      const data = await response.json();
      setEmotion(data.emotion);
    } catch {
      toast.error("Ошибка сети! Попробуйте позже.");
      setShowForm(true);
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  return (
    <main className="h-full">
      <HeaderAuth />
      <div className="flex justify-center items-center w-full flex-col h-[70dvh] ">
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
            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-[#312E2F] max-w-[1100px] mt-24 rounded-3xl w-full"
            >
              <input
                className="placeholder text-xl text-[#AFAFAF] max-w-[1100px] rounded-3xl px-8 py-4 mobile:py-6 w-full placeholder:text-xl Inter font-bold bg-inherit outline-none"
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

        {!loading && showResult && emotion && (
          <div className="transition-opacity duration-700 mt-8 text-xl text-white opacity-100 block">
            <ResultSection
              emotion={emotion}
              onGenerateMore={handleGenerateMore}
            />
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </main>
  );
};

export default Page;