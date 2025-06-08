"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/Header/header";
import NavShelf from "@/components/NavShelf/navShelf";
import { AboutSection } from "@/sections/AboutSection/aboutSection";
import PreviewSection from "@/sections/PreviewSection/previewSection";
import WorkSection from "@/sections/WorkSection/workSection";
import DemoSection from "@/sections/DemoSection/demoSection";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isWorkVisible, setIsWorkVisible] = useState(false);
  const [isDemoVisible, setIsDemoVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("preview");
  // const { push } = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("authToken");
  //   if (token) {
  //     push("/emojify");
  //   }
  // }, [push]);

  const previewRef = useRef(null);
  const aboutRef = useRef(null);
  const workRef = useRef(null);
  const demoRef = useRef(null);

  useEffect(() => {
    const previewObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setActiveSection("preview");
      },
      { threshold: 0.4 }
    );
  
    const aboutObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        setIsAboutVisible(isVisible);
        if (isVisible) setActiveSection("about");
      },
      { threshold: 0.4 }
    );
  
    const workObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        setIsWorkVisible(isVisible);
        if (isVisible) setActiveSection("work");
      },
      { threshold: 0.4 }
    );
  
    const demoObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        setIsDemoVisible(isVisible);
        if (isVisible) setActiveSection("demo");
      },
      { threshold: 0.4 }
    );
  
    if (previewRef.current) previewObserver.observe(previewRef.current);
    if (aboutRef.current) aboutObserver.observe(aboutRef.current);
    if (workRef.current) workObserver.observe(workRef.current);
    if (demoRef.current) demoObserver.observe(demoRef.current);
  
    return () => {
      if (previewRef.current) previewObserver.unobserve(previewRef.current);
      if (aboutRef.current) aboutObserver.unobserve(aboutRef.current);
      if (workRef.current) workObserver.unobserve(workRef.current);
      if (demoRef.current) demoObserver.unobserve(demoRef.current);
    };
  }, []);
  

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header isScrolled={isScrolled} activeSection={activeSection} />
      {/* <Headerr/> */}
      <NavShelf isScrolled={isScrolled} activeSection={activeSection} />

      <div className="relative px-3">
        <section
          id="home"
          ref={previewRef}
          className={`h-screen transition-opacity duration-700 ${
            isAboutVisible || isWorkVisible || isDemoVisible
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <PreviewSection />
        </section>

        <section
          id="about"
          ref={aboutRef}
          className={`h-screen transition-opacity duration-700 ${
            isAboutVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <AboutSection />
        </section>

        <section
          id="work"
          ref={workRef}
          className={`h-screen transition-opacity duration-700 ${
            isWorkVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <WorkSection />
        </section>
        <section
          id="demo"
          ref={demoRef}
          className={`h-screen transition-opacity duration-700 ${
            isDemoVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <DemoSection />
        </section>
      </div>
    </div>
  );
}
