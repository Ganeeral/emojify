"use client";

import HeaderAuth from "@/components/HeaderAuth/headerAuth";
import ProfileSection from "@/sections/ProfileSection/profileSection";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  // const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // setIsClient(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth");
    }
  }, []);

  return (
    <>
      <HeaderAuth />
      <ProfileSection />
    </>
  );
};

export default Page;
