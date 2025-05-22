"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HeaderAuth = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const { push } = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    push("/");
  };

  return (
    <div className="flex p-8 w-full relative">
      <Link
        href="/emojify"
        className="bg-[#464344] rounded-[99px] px-8 py-3 mx-auto"
      >
        <span className="gradientText Inter font-bold">Анимоджи</span>
      </Link>

      <div className="">
        <div
          onClick={toggleMenu}
          className="cursor-pointer rounded-full h-[50px] w-[50px] bg-[#1D73F3] flex items-center justify-center text-[22px] font-normal text-white absolute right-8 transition-transform duration-300 hover:scale-105"
        >
          A
        </div>

        {isMenuOpen && (
          <div className="absolute right-6 top-[5.5rem] w-[200px] bg-[#2d2c2e] rounded-lg shadow-lg overflow-hidden animate-slideDown">
            <ul className="flex flex-col">
              <li className="border-b border-gray-600">
                <Link
                  href="/profile"
                  className="block px-6 Inter font-bold py-3 text-white hover:bg-[#3c3a3b] transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Профиль
                </Link>
              </li>
              <li>
                <button
                  className="block w-full Inter font-bold text-left px-6 py-3 text-white hover:bg-[#3c3a3b] transition-all"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Выход
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderAuth;
