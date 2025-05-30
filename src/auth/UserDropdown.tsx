// src/components/UserDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import { db } from "../provideDB/firebase/config";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { configDB } from "@/db";

interface ConfigWithOwner {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  entries: any[];
  createdAt: Date;
  updatedAt: Date;
}

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { config, workspace, scenario } = useParams<{ 
    config?: string; 
    workspace?: string; 
    scenario?: string; 
  }>();
  const { user, signOut } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configs, setConfigs] = useState<ConfigWithOwner[]>([]);
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

  // Nazwa konfiguracji (bez uid)
  const configName = [config, workspace, scenario]
    .filter(Boolean)
    .join("-") || "default";

  // Fetch wszystkich konfiguracji z Firestore (publiczny odczyt)
  const loadConfigs = async () => {
    try {
      const configsRef = collection(db, "configs");
      const querySnapshot = await getDocs(configsRef);
      
      const configsList: ConfigWithOwner[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        configsList.push({
          id: doc.id,
          name: data.name,
          owner: data.owner,
          ownerEmail: data.ownerEmail,
          entries: data.entries || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      // Sortuj po dacie aktualizacji (najnowsze pierwsze)
      configsList.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setConfigs(configsList);
    } catch (err) {
      console.error('Błąd ładowania konfiguracji:', err);
    }
  };

  const openConfigModal = () => {
    setIsConfigOpen(true);
    loadConfigs();
  };

  // Zapisz bieżącą konfigurację (tylko właściciel)
  const saveCurrentConfig = async () => {
    if (!user) {
      alert('Musisz się zalogować, aby zapisać konfigurację');
      return;
    }

    try {
      const all = await configDB.records.toArray();
      const data = all.map(r => {
        const dateObj = new Date(r.updatedAt);
        const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
        return { id: r.id, data: r.data, updatedAt: validDate.toISOString() };
      });

      // Sprawdź czy konfiguracja już istnieje
      const existingConfigQuery = query(
        collection(db, "configs"), 
        where("name", "==", configName)
      );
      const existingSnapshot = await getDocs(existingConfigQuery);
      
      let canSave = true;
      let docId = `${user.uid}_${configName}_${Date.now()}`;
      
      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0];
        const existingData = existingDoc.data();
        
        // Sprawdź czy user jest właścicielem
        if (existingData.owner !== user.uid) {
          alert('Nie możesz nadpisać konfiguracji należącej do innego użytkownika');
          canSave = false;
        } else {
          // User jest właścicielem, użyj istniejącego id
          docId = existingDoc.id;
        }
      }
      
      if (canSave) {
        const docRef = doc(db, "configs", docId);
        await setDoc(docRef, {
          name: configName,
          owner: user.uid,
          ownerEmail: user.email,
          entries: data,
          createdAt: existingSnapshot.empty ? new Date() : undefined,
          updatedAt: new Date(),
        }, { merge: true });
        
        alert('Konfiguracja została zapisana');
        loadConfigs();
      }
    } catch (err) {
      console.error('Błąd zapisywania konfiguracji:', err);
      alert('Wystąpił błąd podczas zapisywania konfiguracji');
    }
  };

  // Wczytaj konfigurację (publiczny dostęp)
  const loadConfig = async (configId: string) => {
    try {
      const docRef = doc(db, "configs", configId);
      const snap = await getDoc(docRef);
      
      if (!snap.exists()) {
        alert('Konfiguracja nie została znaleziona');
        return;
      }
      
      const { entries } = snap.data();

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
    } catch (err) {
      console.error('Błąd wczytywania konfiguracji:', err);
      alert('Wystąpił błąd podczas wczytywania konfiguracji');
    }
  };

  // Usuń konfigurację (tylko właściciel)
  const deleteConfig = async (configId: string, configItem: ConfigWithOwner) => {
    if (!user) {
      alert('Musisz się zalogować, aby usunąć konfigurację');
      return;
    }

    if (configItem.owner !== user.uid) {
      alert('Możesz usuwać tylko swoje konfiguracje');
      return;
    }

    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć konfigurację '${configItem.name}'?`
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "configs", configId));
      alert('Konfiguracja została usunięta');
      loadConfigs();
    } catch (err) {
      console.error('Błąd usuwania konfiguracji:', err);
      alert('Wystąpił błąd podczas usuwania konfiguracji');
    }
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
          <div className="bg-white p-6 rounded-md w-96 max-h-[80vh] overflow-auto">
            <h3 className="text-lg mb-4">Wszystkie konfiguracje</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {configs.map(config => (
                <div key={config.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{config.name}</p>
                      <p className="text-xs text-gray-500">
                        Właściciel: {config.ownerEmail}
                      </p>
                      <p className="text-xs text-gray-400">
                        {config.updatedAt.toLocaleDateString()} {config.updatedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => loadConfig(config.id)}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        Wczytaj
                      </button>
                      {user && config.owner === user.uid && (
                        <button
                          onClick={() => deleteConfig(config.id, config)}
                          className="text-xs px-2 py-1 border rounded text-red-500 hover:bg-gray-100"
                        >
                          Usuń
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {configs.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Brak zapisanych konfiguracji
                </p>
              )}
            </div>
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