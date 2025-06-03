"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CloseIcon, HideIcon } from "@/ui/icons";
import cn from "classnames";
import Link from "next/link";
import "@/app/globals.css";

const LoginPage: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);
  const { push } = useRouter();

  const validateEmail = () => {
    if (!email) {
      setEmailError("Введите email");
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Некорректный формат email");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Введите пароль");
    } else if (password.length < 6) {
      setPasswordError("Пароль должен содержать не менее 6 символов");
    } else {
      setPasswordError("");
    }
  };

  const checkFormValidity = useCallback(() => {
    if (!emailError && !passwordError && email && password) {
      setFormIsValid(true);
    } else {
      setFormIsValid(false);
    }
  }, [emailError, passwordError, email, password]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      push("/profile");
    }
    checkFormValidity();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    validateEmail();
    validatePassword();

    if (formIsValid) {
      try {
        const response = await fetch(
          "https://emojify-backend.cloudpub.ru/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          const { token, user } = data;
          const { ID } = user;
          localStorage.setItem("authToken", token);
          localStorage.setItem("id", ID);
          toast.success("Успешный вход! Перенаправление...");
          setTimeout(() => {
            push("/profile");
          }, 1000);
        } else {
          toast.error(data.message || "Ошибка авторизации");
        }
      } catch {
        toast.error("Ошибка авторизации");
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="flex relative justify-center items-center h-full">
      <div className="absolute clamp-Logo gradientText">Анимоджи</div>
      <div className="min-w-[300px] my-10 max-w-[670px] w-full flex flex-col gap-y-4 mx-2">
        <div className="rounded-[36px] backgroundAuth p-4 flex flex-col gap-y-8">
          <div className="relative flex justify-center ">
            <div className="absolute right-0">
              <Link href="/">
                <CloseIcon />
              </Link>
            </div>
          </div>

          <form
            method="post"
            className={cn(
              "px-4 py-4 flex justify-center items-center flex-col border divide-solid rounded-3xl border-[#565656] gap-y-12",
              "mobile:px-10 flix:py-8",
              "tablet-s:px-14 tablet-s:py-10"
            )}
            onSubmit={handleLogin}
          >
            <label className="text-center Inter font-bold text-display-1 mobile:text-display-2 text-searchText">
              Вход
            </label>
            <div className="flex flex-col gap-y-6 w-full">
              <div className="flex flex-col gap-y-3 max-w-[528px] w-full">
                <label className="text-searchText Inter font-bold text-lg leading-5">
                  Email
                </label>
                <input
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={validateEmail}
                  type="email"
                  className={cn(
                    "border placeholder:text-searchText Inter placeholder:text-base divide-solid border-[#666666] bg-inherit h-[56px] rounded-xl outline-none px-2 text-searchText text-xl w-full",
                    { "border-red-500": emailError }
                  )}
                />
                {emailError && (
                  <p className="text-red-500 Inter text-xs">{emailError}</p>
                )}
              </div>
              <div className="flex flex-col gap-y-3 max-w-[528px] w-full">
                <div className="flex justify-between w-full">
                  <label className="text-searchText Inter font-bold text-lg leading-5">
                    Пароль
                  </label>
                  <div className="cursor-pointer">
                    <HideIcon onClick={togglePasswordVisibility} />
                  </div>
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={validatePassword}
                  className={cn(
                    "border placeholder:text-searchText Inter placeholder:text-base divide-solid border-[#666666] bg-inherit h-[56px] rounded-xl outline-none px-2 text-searchText text-xl w-full",
                    { "border-red-500": passwordError }
                  )}
                />
                {passwordError && (
                  <p className="text-red-500 Inter text-xs">{passwordError}</p>
                )}
              </div>
              <div className="flex flex-col gap-y-4">
                <button
                  type="submit"
                  className={cn(
                    "w-full Inter font-bold Inter text-xl leading-5 rounded-[40px] p-5 bg-blacked text-white duration-300 hover:bg-searchText",
                    { "opacity-50 cursor-not-allowed": !formIsValid }
                  )}
                  disabled={!formIsValid}
                >
                  Войти
                </button>
                <p className="text-searchText Inter font-medium text-sm mobile:text-base text-center">
                  Продолжая, вы соглашаетесь с{" "}
                  <a
                    target="_blank"
                    href="privacy_policy.pdf"
                    className="text-[#d4d4d4] underline underline-offset-4"
                  >
                    Политикой конфиденциальности.
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
        <Link href="/registration">
          <button className="w-full text-xl Inter font-bold leading-5 rounded-[40px] p-5 bg-blacked text-white duration-300 btn">
            Создать аккаунт
          </button>
        </Link>
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
      </div>
    </div>
  );
};

export default LoginPage;
