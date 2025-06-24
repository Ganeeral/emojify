"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface HeaderProps {
  isScrolled: boolean;
  activeSection: string;
}

const data = [
  { id: 1, content: "Анимоджи", href: "#preview", key: "preview" },
  { id: 2, content: "О проекте", href: "#about", key: "about" },
  { id: 3, content: "Как работает?", href: "#work", key: "work" },
  { id: 4, content: "Демо", href: "#demo", key: "demo" },
];

const Header: React.FC<HeaderProps> = ({ isScrolled, activeSection }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="p-8 z-20 fixed w-full flex items-center justify-between transition-all duration-500">
      <div
        className={`transition-opacity duration-500 ${
          isScrolled ? "opacity-0" : "opacity-100"
        }`}
      >
        <Link href="/">
          <span className="gradientText Inter font-bold text-3xl">
            Анимоджи
          </span>
        </Link>
      </div>

      <div
        className={`flex z-[999] bottom-11 left-1/2 transform -translate-x-1/2 fixed ${
          isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
        } bg-[#464344] px-8 py-5 mobile:py-3 gap-x-8 items-center rounded-[99px] justify-center transition-opacity duration-500`}
      >
        <span className="gradientText Inter font-bold text-xl mobile:hidden">
          Анимоджи
        </span>
        {data.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="relative hidden mobile:block"
          >
            <p
              className={`text-[#888888] Inter font-semibold transition-all ${
                activeSection === item.key
                  ? "text-white after:absolute after:left-1/2 after:bottom-[-4px] after:h-[2px] after:w-full bgGradient after:rounded-lg after:transform after:translate-x-[-50%]"
                  : "hover:text-white"
              }`}
            >
              {item.content}
            </p>
          </Link>
        ))}
      </div>

      <div
        className={`transition-opacity ml-auto duration-500 ${
          isScrolled ? "opacity-0" : "opacity-100"
        }`}
      >
        {isAuthenticated ? (
          // Меню для авторизованного пользователя
          <div className="relative">
            <div
              onClick={toggleMenu}
              className="cursor-pointer rounded-full h-[50px] w-[50px] bg-[#1D73F3] flex items-center justify-center text-[22px] font-normal text-white absolute right-8 transition-transform duration-300 hover:scale-105"
            >
              A
            </div>

            {isMenuOpen && (
              <div className="absolute right-6 top-14 w-[200px] bg-[#2d2c2e] rounded-lg shadow-lg overflow-hidden animate-slideDown">
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
                        localStorage.removeItem("authToken");
                        setIsAuthenticated(false); // Удаляем токен и сбрасываем состояние
                      }}
                    >
                      Выход
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          // Кнопка "Войти" для неавторизованных пользователей
          <Link
            href="/auth"
            className="Inter rounded-[55px] border-[0.7px] border-white px-5 mobile:px-8 py-3 hover:bg-white hover:text-black transition-all duration-500 font-bold"
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
