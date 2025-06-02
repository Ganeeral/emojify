"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import Image from "next/image";
import { LoadIcon } from "@/ui/icons";
import { AnimatePresence, motion } from "framer-motion"; // Добавь framer-motion

import { getImageForEmotion } from "@/utils/emotionGeneration";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface SavedImage {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  UserID: number;
  Query: string;
  Style: string;
  Width: number;
  Height: number;
  UUID: string;
  Status: string;
  ImageB64: string;
}

interface SceneData {
  Id: number;
  Scene: string;
  Emotion: string;
}

const ProfileSection = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingScenes, setLoadingScenes] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { push } = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    push("/");
  };

  const updateProfileName = (newName: string) => {
    if (profile) {
      setProfile({ ...profile, name: newName });
    }
  };

  // Запрос профиля
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setLoadingProfile(true);
    axios
      .get("https://emojify-backend.cloudpub.ru/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setProfile(response.data))
      .catch(() => push("/"))
      .finally(() => setLoadingProfile(false));
  }, [push]);

  // Запрос изображений
  useEffect(() => {
    if (!profile) return;
    const token = localStorage.getItem("authToken");

    setLoadingImages(true);
    axios
      .get(
        `https://emojify-backend.cloudpub.ru/saved-images?user_id=${profile.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setSavedImages(res.data || []))
      .catch(() => setSavedImages([]))
      .finally(() => setLoadingImages(false));
  }, [profile]);

  // Запрос сцен
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setLoadingScenes(true);
    axios
      .get("https://emojify-backend.cloudpub.ru/scenes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setScenes(res.data || []))
      .catch(() => setScenes([]))
      .finally(() => setLoadingScenes(false));
  }, []);

  return (
    <div className="grid gap-y-12 mx-auto w-full max-w-[1070px] px-4">
      {/* Header */}
      {loadingProfile ? (
        <div className="grid bg-[#1A1A1A] rounded-xl p-6 w-full grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-y-4 sm:gap-y-0 animate-pulse">
          <div className="flex items-center gap-x-5">
            <div className="h-[74px] w-[74px] bg-[#2A2A2A] rounded-full" />
            <div className="flex flex-col gap-y-1 items-start">
              <div className="h-6 w-32 bg-[#2A2A2A] rounded-md" />
              <div className="h-4 w-24 bg-[#2A2A2A] rounded-md mt-1" />
            </div>
          </div>
          <div className="h-8 w-20 bg-[#2A2A2A] rounded-md sm:justify-self-end" />
        </div>
      ) : (
        <div className="grid bg-[#0D0D0D] rounded-xl p-6 w-full grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-y-4 sm:gap-y-0">
          <div className="flex items-center gap-x-5">
            <div className="h-[74px] w-[74px] flex justify-center items-center text-3xl rounded-full text-white bg-sky-600">
              {profile?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-y-1 items-start">
              <span className="text-2xl text-[#B0B0B0] Inter font-semibold">
                {profile?.name}
              </span>
              <button
                onClick={() => setShowModal(true)}
                className="text-[#626262] Inter font-medium text-sm"
              >
                Изменить профиль
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 max-h-[38px] rounded-md Inter font-semibold bg-[#393939] text-[#B0B0B0] sm:justify-self-end"
          >
            Выйти
          </button>
        </div>
      )}

      {!loadingProfile && showModal && profile && (
        <EditProfileModal
          currentName={profile.name}
          onClose={() => setShowModal(false)}
          onUpdate={updateProfileName}
        />
      )}

      {/* Мои изображения */}
      <div className="grid gap-y-6 bg-[#0D0D0D] rounded-xl w-full px-4 lg:px-[75px] py-6">
        <p className="Inter font-bold text-xl">Мои изображения</p>

        {loadingImages ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, idx) => (
              <div
                key={idx}
                className="relative flex flex-col bg-[#1A1A1A] rounded-xl shadow-md overflow-hidden animate-pulse"
              >
                <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-sm rounded-lg w-12 h-4" />
                <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full w-6 h-6" />
                <div className="w-full h-[180px] bg-[#2A2A2A]" />
                <div className="absolute bottom-0 w-full h-8 bg-black/20 backdrop-blur-md" />
              </div>
            ))}
          </div>
        ) : savedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedImages.map((img) => {
              const dataUri = `data:image/jpeg;base64,${img.ImageB64}`;
              return (
                <div
                  key={img.ID}
                  className="relative flex flex-col bg-[#121212] rounded-xl shadow-md overflow-hidden"
                >
                  <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold text-[#E0E0E0]">
                    {img.Style}
                  </span>
                  <a
                    href={dataUri}
                    download={`${img.Query || img.UUID}.jpg`}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg p-2"
                  >
                    <LoadIcon />
                  </a>
                  <div className="w-full h-[180px] bg-[#1A1A1A] flex items-center justify-center">
                    <Image
                      src={dataUri}
                      alt={img.Style}
                      className="object-cover w-full h-full cursor-pointer"
                      width={300}
                      height={180}
                      unoptimized
                      onClick={() => setSelectedImage(dataUri)}
                    />
                  </div>
                  <div className="absolute bottom-0 w-full flex justify-center items-center bg-black/50 backdrop-blur-md h-8">
                    <p className="Inter font-bold text-xs text-[#BEBEBE] truncate max-w-[120px]">
                      {img.Query}
                    </p>
                  </div>
                </div>
              );
            })}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                >
                  <motion.img
                    src={selectedImage}
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
          </div>
        ) : (
          <p className="text-[#BEBEBE]">Нет сохранённых изображений.</p>
        )}
      </div>

      {/* Мои сцены */}
      <div className="grid gap-y-6 bg-[#0D0D0D] rounded-xl w-full px-4 lg:px-[75px] py-6">
        <p className="Inter font-bold text-xl">Мои сцены</p>
        {loadingScenes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-[#121212] p-3 flex items-center flex-col gap-y-4 relative animate-pulse"
              >
                <div className="absolute top-3 left-3 bg-black/30 rounded-lg w-20 h-6" />
                <div className="mt-6 w-[116px] h-[116px] bg-[#2A2A2A] rounded-full" />
                <div className="bg-[#191919] w-full h-10 rounded-lg" />
              </div>
            ))}
          </div>
        ) : scenes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene) => {
              const imageUrl = getImageForEmotion(scene.Emotion);
              return (
                <div
                  key={scene.Id}
                  className="rounded-lg bg-[#121212] p-3 flex items-center flex-col gap-y-4 relative"
                >
                  <span className="px-6 py-2 bg-[#1A1A1A] rounded-lg text-sm text-[#BEBEBE] Inter font-bold absolute top-3 left-3">
                    {scene.Emotion}
                  </span>
                  {imageUrl ? (
                    <Image
                      className="mt-6"
                      alt={`Эмоция: ${scene.Emotion}`}
                      width={116}
                      height={116}
                      src={imageUrl}
                    />
                  ) : (
                    <p className="text-[#BEBEBE] mt-6">Нет изображения</p>
                  )}
                  <div className="bg-[#191919] Inter font-bold text-xs text-[#BEBEBE] p-2 rounded-lg text-center">
                    {scene.Scene}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[#BEBEBE]">Нет доступных сцен для отображения.</p>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
