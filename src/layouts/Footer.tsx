// src/layouts/Footer.tsx
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className="relative">
      {/* Dekorator: czarny trójkąt przyklejony do prawej krawędzi od góry */}
      <svg
        className="absolute -top-6 right-0 h-8 w-16 text-black"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon fill="currentColor" points="100,0 100,50 0,50" />
      </svg>

      <footer className="bg-black py-8 text-center text-sm text-white  pb-20">
        <div className="container mx-auto px-4 flex justify-end gap-2">
          <nav className="mb-4">
            {/* Używamy linku względnego – zakładając, że jesteśmy w obrębie ścieżki /:lang */}
            <Link to="projects" className="text-white hover:underline mx-2">
              MediaStrategist project
            </Link>
          </nav>
          <span>/</span>
          <p>&copy; 2025 thecontext.onrender.com</p>
          <span>/</span>
          <p>ver 0.8.3</p>
        </div>
      </footer>
    </div>
  );
};
