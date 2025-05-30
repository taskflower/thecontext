// src/components/UserDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import { db } from "../provideDB/firebase/config";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { configDB } from "@/db";

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { config, workspace, scenario } = useParams<{ config?: string; workspace?: string; scenario?: string }>();
  const { user, signOut } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configs, setConfigs] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Zamknij dropdown i modal po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsConfigOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Klucz konfiguracji: nazwa z folderu _configs (params) lub domyślny
  const defaultConfigId = [config, workspace, scenario]
    .filter(Boolean)
    .join("-") || "default";

  // Fetch listy konfiguracji z Firestore
  const loadConfigs = async () => {
    if (!user) return;
    const col = collection(db, "userConfigs", user.uid, "configs");
    const snap = await getDocs(col);
    setConfigs(snap.docs.map(d => d.id));
  };

  const openConfigModal = () => {
    setIsConfigOpen(true);
    loadConfigs();
  };

  // Upewniamy się, że updatedAt jest prawidłowy
  const saveCurrentConfig = async () => {
    if (!user) return;
    const all = await configDB.records.toArray();
    const data = all.map(r => {
      const dateObj = new Date(r.updatedAt);
      const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
      return { id: r.id, data: r.data, updatedAt: validDate.toISOString() };
    });
    const cfgId = defaultConfigId;
    const docRef = doc(db, "userConfigs", user.uid, "configs", cfgId);
    await setDoc(docRef, { entries: data });
    loadConfigs();
  };

  const loadConfig = async (cfgId: string) => {
    if (!user) return;
    const docRef = doc(db, "userConfigs", user.uid, "configs", cfgId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const { entries }: any = snap.data();

    // Synchronizacja: wyczyść lokalnie i wstaw nowe
    await configDB.records.clear();
    for (const e of entries) {
      const updatedAt = e.updatedAt && typeof e.updatedAt.toDate === 'function'
        ? e.updatedAt.toDate()
        : new Date(e.updatedAt);
      await configDB.records.put({ id: e.id, data: e.data, updatedAt });
    }

    setIsConfigOpen(false);
    setIsOpen(false);
    window.location.reload();
  };

  const deleteConfig = async (cfgId: string) => {
    if (!user) return;
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć konfigurację '${cfgId}'?`
    );
    if (!confirmed) return;
    await deleteDoc(doc(db, "userConfigs", user.uid, "configs", cfgId));
    loadConfigs();
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Login
      </button>
    );
  }

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
    navigate("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
          {user.displayName?.[0].toUpperCase() || "U"}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
          <div className="px-4 py-3">
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="py-1 divide-y">
            <button
              onClick={openConfigModal}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Konfiguracje
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Wyloguj
            </button>
          </div>
        </div>
      )}

      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-md w-80 max-h-[80vh] overflow-auto">
            <h3 className="text-lg mb-4">Zapisane konfiguracje</h3>
            <ul className="space-y-2">
              {configs.map(id => (
                <li key={id} className="flex justify-between items-center">
                  <span className="truncate">{id}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => loadConfig(id)}
                      className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      Wczytaj
                    </button>
                    <button
                      onClick={() => deleteConfig(id)}
                      className="text-sm px-2 py-1 border rounded text-red-500 hover:bg-gray-100"
                    >
                      Usuń
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <button
                onClick={saveCurrentConfig}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Zapisz bieżącą
              </button>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;