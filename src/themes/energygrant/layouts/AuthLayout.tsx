// File: src/themes/energygrant/layouts/AuthLayout.tsx

import React, { useState } from "react";
import { I } from "@/components";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

interface Props {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);

  

  // Wylogowanie
  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  if (!user) {
    // Widok logowania
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Zaloguj się</h2>
          <button
            onClick={() => console.log("Zaloguj przez Google")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <I name="google" className="w-5 h-5 mr-2" />
            Zaloguj przez Google
          </button>
        </div>
      </div>
    );
  }

  // Widok profilu po zalogowaniu
  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center space-x-4">
        {user.picture && (
          <img
            src={user.picture}
            alt="avatar"
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h3 className="text-lg font-medium">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imię i nazwisko
          </label>
          <input
            type="text"
            defaultValue={user.name}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            defaultValue={user.email}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            disabled
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Zapisz zmiany
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline"
        >
          Wyloguj się
        </button>
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
