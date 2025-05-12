// src/themes/goldsaver/components/common/Footer.tsx
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <p>© 2025 GoldSaver. Wszystkie prawa zastrzeżone.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-700">
            Regulamin
          </a>
          <a href="#" className="hover:text-gray-700">
            Polityka prywatności
          </a>
          <a href="#" className="hover:text-gray-700">
            Kontakt
          </a>
        </div>
      </div>
    </footer>
  );
};