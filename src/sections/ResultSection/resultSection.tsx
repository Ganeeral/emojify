import React from "react";
import Image from "next/image";
import { LoadIcon } from "@/ui/icons";
import { getImageForEmotion } from "@/utils/emotionGeneration";
interface ResultSectionProps {
  emotion: string;
  onGenerateMore: () => void;
}

const ResultSection: React.FC<ResultSectionProps> = ({
  emotion,
  onGenerateMore,
}) => {
  const imageUrl = getImageForEmotion(emotion);
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex flex-col gap-y-6">
        <Image
          src={getImageForEmotion(emotion)}
          height={401}
          width={401}
          alt={`Изображение для эмоции ${emotion}`}
        />
        <div className="flex justify-center items-center gap-x-3">
          <span className="px-14 py-4 bg-[#1A1A1A] rounded-xl text-2xl text-[#BEBEBE] Inter font-bold">
            {emotion}
          </span>
          {emotion != "некорректный запрос" && (
            <a
              href={imageUrl}
              download
              className="px-6 py-6 rounded-xl bg-[#1A1A1A] cursor-pointer"
            >
              <LoadIcon />
            </a>
          )}
        </div>
        <div className="flex justify-center items-center">
          <button
            onClick={onGenerateMore}
            className="px-14 py-4 bg-[#1A1A1A] rounded-xl text-2xl text-[#BEBEBE] Inter font-bold"
          >
            Сгенерируем еще?
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
