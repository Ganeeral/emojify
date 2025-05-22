import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface EditProfileModalProps {
  currentName: string;
  onClose: () => void;
  onUpdate: (newName: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentName,
  onClose,
  onUpdate,
}) => {
  const [Name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!Name.trim()) {
      toast.error("Имя не может быть пустым");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        "https://emojify-backend.cloudpub.ru/edit",
        { Name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onUpdate(Name);
      toast.success("Имя успешно обновлено");
      onClose();
    } catch {
      toast.error("Ошибка при обновлении имени");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 Inter font-bold bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-[#1A1A1A] text-white p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4">Изменить имя</h2>
        <input
          type="text"
          value={Name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите новое имя"
          className="w-full p-3 rounded bg-[#2C2C2C] text-white mb-4 outline-none"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition"
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
