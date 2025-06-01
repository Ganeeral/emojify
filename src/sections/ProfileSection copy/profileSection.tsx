// components/ProfileSection/ProfileSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import Image from "next/image";
import { LoadIcon } from "@/ui/icons";

interface ProfileData {
  id: number; // ожидаем { id, name, email, avatar }
  name: string;
  email: string;
  avatar: string;
}

interface SavedImage {
  ID: number; // GORM отдаёт поле "ID"
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  UserID: number;
  Query: string;
  Style: string;
  Width: number;
  Height: number;
  UUID: string;
  Status: string; // PENDING / DONE / FAILED
  ImageB64: string; // Base64-строка картинки
}

const ProfileSection = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const { push } = useRouter();

  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    push("/");
  };

  // Обновление имени после редактирования
  const updateProfileName = (newName: string) => {
    if (profile) {
      setProfile({ ...profile, name: newName });
    }
  };

  // Запрос профиля
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get("https://emojify-backend.cloudpub.ru/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProfile(response.data);
      })
      .catch(() => {
        push("/");
      });
  }, [push]);

  // Запрос сохранённых изображений, когда профиль загружен
  useEffect(() => {
    if (!profile) return;

    const token = localStorage.getItem("authToken");
    setLoadingImages(true);
    axios
      .get(
        `https://emojify-backend.cloudpub.ru/saved-images?user_id=${profile.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setSavedImages(response.data || []);
        setLoadingImages(false);
      })
      .catch(() => {
        setSavedImages([]);
        setLoadingImages(false);
      });
  }, [profile]);

  // Если профиль ещё не загрузился — рендерим «скелетон» шапки и «скелетоны» сетки
  if (!profile) {
    return (
      <div className="grid gap-y-12 mx-auto w-full max-w-[1070px] px-4">
        {/* Скелетон шапки профиля */}
        <div className="grid bg-[#1A1A1A] rounded-xl p-6 w-full grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-y-4 sm:gap-y-0 animate-pulse">
          <div className="flex items-center gap-x-5">
            {/* Заглушка аватара */}
            <div className="h-[74px] w-[74px] bg-[#2A2A2A] rounded-full" />
            <div className="flex flex-col gap-y-1 items-start">
              {/* Заглушка имени */}
              <div className="h-6 w-32 bg-[#2A2A2A] rounded-md" />
              {/* Заглушка кнопки «Изменить профиль» */}
              <div className="h-4 w-24 bg-[#2A2A2A] rounded-md mt-1" />
            </div>
          </div>
          {/* Заглушка кнопки «Выйти» */}
          <div className="h-8 w-20 bg-[#2A2A2A] rounded-md sm:justify-self-end" />
        </div>

        {/* Секция с «заглушками» изображений (9 карточек) */}
        <div className="grid gap-y-6 bg-[#0D0D0D] rounded-xl w-full px-4 lg:px-[75px] py-6">
          <div className="flex justify-between items-center">
            {/* Заглушка заголовка */}
            <div className="h-6 w-40 bg-[#2A2A2A] rounded-md animate-pulse" />
            {/* Заглушка кнопки «Мои сцены» */}
            <div className="h-4 w-24 bg-[#2A2A2A] rounded-md animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, idx) => (
              <div
                key={idx}
                className="relative flex flex-col bg-[#1A1A1A] rounded-xl shadow-md overflow-hidden animate-pulse"
              >
                {/* Заглушка тега «Стиль» */}
                <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-sm rounded-lg w-12 h-4" />

                {/* Заглушка иконки загрузки */}
                <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full w-6 h-6" />

                {/* Заглушка картинки */}
                <div className="w-full h-[180px] bg-[#2A2A2A]" />

                {/* Заглушка подписи */}
                <div className="absolute bottom-0 w-full h-8 bg-black/20 backdrop-blur-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Когда профиль загружен, отображаем его и/или «скелетоны» для изображений
  return (
    <div className="grid gap-y-12 mx-auto w-full max-w-[1070px] px-4">
      {/* Шапка профиля */}
      <div className="grid bg-[#0D0D0D] rounded-xl p-6 w-full grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-y-4 sm:gap-y-0">
        <div className="flex items-center gap-x-5">
          <div className="h-[74px] w-[74px] flex justify-center items-center text-3xl rounded-full text-white bg-sky-600">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-y-1 items-start">
            <span className="text-2xl text-[#B0B0B0] Inter font-semibold">
              {profile.name}
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

      {showModal && (
        <EditProfileModal
          currentName={profile.name}
          onClose={() => setShowModal(false)}
          onUpdate={updateProfileName}
        />
      )}

      {/* Секция с сохранёнными изображениями */}
      <div className="grid gap-y-6 bg-[#0D0D0D] rounded-xl w-full px-4 lg:px-[75px] py-6">
        <div className="flex justify-between items-center">
          <p className="Inter font-bold text-xl">Мои изображения</p>
          <button
            onClick={() => push("/scenes")}
            className="text-[#FFD580] Inter font-medium text-sm hover:underline"
          >
            Мои сцены
          </button>
        </div>

        {loadingImages ? (
          /* Скелетоны: сетка из девяти карточек-заглушек */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, idx) => (
              <div
                key={idx}
                className="relative flex flex-col bg-[#1A1A1A] rounded-xl shadow-md overflow-hidden animate-pulse"
              >
                {/* Заглушка тега «Стиль» */}
                <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-sm rounded-lg w-12 h-4" />

                {/* Заглушка иконки загрузки */}
                <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full w-6 h-6" />

                {/* Заглушка картинки */}
                <div className="w-full h-[180px] bg-[#2A2A2A]" />

                {/* Заглушка подписи */}
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
                  {/* Тег «Стиль» сверху слева */}
                  <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold text-[#E0E0E0] opacity-80">
                    {img.Style}
                  </span>

                  {/* Иконка загрузки */}
                  <a
                    href={dataUri}
                    download={`${img.Query || img.UUID}.jpg`}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg p-2 opacity-80 hover:opacity-100 transition"
                  >
                    <LoadIcon />
                  </a>

                  {/* Блок с картинкой (фиксированная высота, object-cover) */}
                  <div className="w-full h-[180px] bg-[#1A1A1A] flex items-center justify-center">
                    <Image
                      src={dataUri}
                      alt={img.Style}
                      className="object-cover w-full h-full"
                      width={300}
                      height={180}
                      unoptimized
                    />
                  </div>

                  {/* Нижняя часть с подписью */}
                  <div className="absolute bottom-0 w-full flex justify-center items-center bg-black/50 backdrop-blur-md h-8">
                    <p className="Inter font-bold text-xs text-[#BEBEBE] truncate max-w-[120px]">
                      {img.Query}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[#BEBEBE]">Нет сохранённых изображений.</p>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
