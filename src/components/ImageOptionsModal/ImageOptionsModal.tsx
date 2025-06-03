"use client";

import React, { useState, useEffect, FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChevronIcon from "@/ui/icons/chevron-down-small.svg";

interface ImageOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  initialStyle?: string;
  onSave: (options: { width: number; height: number; style: string }) => void;
}

const ImageOptionsModal: FC<ImageOptionsModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1024,
  initialHeight = 1024,
  initialStyle = "ANIME",
  onSave,
}) => {
  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialHeight);
  const [style, setStyle] = useState<string>(initialStyle);

  useEffect(() => {
    if (isOpen) {
      setWidth(initialWidth);
      setHeight(initialHeight);
      setStyle(initialStyle);
    }
  }, [isOpen, initialWidth, initialHeight, initialStyle]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1E1E1E] rounded-xl p-6 w-[360px]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-xl Inter font-bold mb-4">
              Параметры картинки
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[#AFAFAF] Inter font-bold">
                  Ширина (px):
                </label>
                <input
                  min={128}
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="mt-1 w-full bg-[#2A2A2A] text-white rounded px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="text-[#AFAFAF] Inter font-bold">
                  Высота (px):
                </label>
                <input
                  min={128}
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-1 w-full bg-[#2A2A2A] text-white rounded px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="text-[#AFAFAF] Inter font-bold">Стиль:</label>
                <div className="relative">
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="mt-1 w-full bg-[#2A2A2A] text-white rounded px-3 py-2 cursor-pointer pr-10 outline-none appearance-none Inter font-bold"
                  >
                    <option value="KANDINSKY">Кандинский</option>
                    <option value="UHD">Детальное фото (UHD)</option>
                    <option value="ANIME">Аниме</option>
                  </select>
                  <div className="pointer-events-none absolute right-2 top-[55%] transform -translate-y-1/2 text-white">
                    <ChevronIcon />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#555] text-white rounded Inter font-bold hover:bg-[#666]"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    onSave({ width, height, style });
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#555]  text-white rounded Inter font-bold hover:bg-[#666]"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageOptionsModal;
