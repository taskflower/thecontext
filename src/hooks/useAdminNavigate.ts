// src/hooks/useAdminNavigate.ts
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export const useAdminNavigate = () => {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();

  return (path: string) => {
    const adminPath = `/admin/${currentLang}${path.startsWith('/') ? path : `/${path}`}`;
    navigate(adminPath);
  };
};