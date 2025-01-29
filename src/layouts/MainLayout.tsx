// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import { Footer } from "@/layouts/Footer";
import { Navbar } from "@/layouts/Navbar";
import { useEffect, useRef } from "react";

export const MainLayout = () => {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (lineRef.current) {
        // Mnożnik 0.3 oznacza, że linia będzie się przesuwać wolniej niż strona
        const scrollY = window.scrollY;
        lineRef.current.style.transform = `translateY(${scrollY * 0.3}px) rotate(-20deg)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="relative flex-grow container mx-auto px-4 py-8 z-0 overflow-hidden">
        <div
          ref={lineRef}
          className="pointer-events-none absolute bottom-[35%] left-[-50%] w-[200%] h-0 
                     border-t border-dashed border-gray-400 origin-center rotate-[-20deg] 
                     z-[-1]"
        />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
