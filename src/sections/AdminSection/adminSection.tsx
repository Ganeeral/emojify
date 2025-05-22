import React from "react";
import Link from "next/link";
import { SearchIcon } from "@/ui/icons";

const AdminSection = () => {
  return (
    <div className="grid gap-y-12 mx-auto w-full max-w-[1070px] px-4">
      <div className="grid bg-[#0D0D0D] rounded-xl p-6 w-full grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-y-4 sm:gap-y-0">
        <div className="flex items-center gap-x-5">
          <div className="h-[74px] w-[74px] flex justify-center items-center text-3xl rounded-full text-white bg-sky-600">
            A
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="text-2xl text-[#B0B0B0] Inter font-semibold">
              Lorem Ipsum
            </span>
            <Link href="/" className="text-[#626262] Inter font-medium text-sm">
              Изменить профиль
            </Link>
          </div>
        </div>

        <button className="px-3 py-2 max-h-[38px] rounded-md Inter font-semibold bg-[#393939] text-[#B0B0B0] sm:justify-self-end">
          Выйти
        </button>
      </div>

      <div className="grid gap-y-6 bg-[#0D0D0D] rounded-xl w-full px-4 lg:px-[75px] py-6">
        <div className="flex gap-y-3  w-full sm:justify-between sm:items-center flex-col sm:flex-row">
          <p className="Inter font-bold text-xl">Список пользователей</p>
          <div className="bg-[#1C1C1C] items-center rounded-md p-2  flex gap-x-2">
            <SearchIcon />
            <input type="search" className="bg-inherit outline-none text-[#B0B0B0] text-xs Inter font-bold"/>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#1C1C1C] text-[#B0B0B0] text-sm items-center gap-x-6 flex p-4 w-full Inter font-bold rounded-lg">
                <span>1</span>
                <span>Lorem Ipsum</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
