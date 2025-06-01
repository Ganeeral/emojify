import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import Image from "next/image";
import { getImageForEmotion } from "@/utils/emotionGeneration";

interface Request {
  Id: number;
  Scene: string;
  Emotion: string;
}

const ProfileSection = () => {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [scenes, setScenes] = useState<Request[]>([]);
  const [loadingScenes, setLoadingScenes] = useState(true);
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get("https://emojify-backend.cloudpub.ru/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setProfile(response.data));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get("https://emojify-backend.cloudpub.ru/scenes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setScenes(response.data);
        setLoadingScenes(false);
      })
      .catch(() => {
        setLoadingScenes(false);
      });
  }, []);

  // if (!profile) return <p>Загрузка...</p>;

  return (
    <div className="grid gap-y-12 mx-auto w-full max-w-[1070px] px-4">
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

      {showModal && (
        <EditProfileModal
          currentName={profile?.name || ""}
          onClose={() => setShowModal(false)}
          onUpdate={updateProfileName}
        />
      )}

      <div className="grid gap-y-6 bg-[#0D0D0D] rounded-xl w-full px-4 lg:px-[75px] py-6">
        <p className="Inter font-bold text-xl">Мои сцены</p>
        {loadingScenes ? (
          <p className="text-[#BEBEBE]">Загрузка сцен...</p>
        ) : scenes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene, index) => {
              const imageUrl = getImageForEmotion(scene.Emotion);
              return (
                <div
                  key={index}
                  className="rounded-lg bg-[#121212] w-full h-full max-h-[240px] p-3 flex items-center flex-col gap-y-4 relative"
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
                  <div className="bg-[#191919] Inter font-bold text-xs text-[#BEBEBE] p-2 rounded-lg">
                    {scene.Scene}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[#BEBEBE] Inter">
            Нет доступных сцен для отображения.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
