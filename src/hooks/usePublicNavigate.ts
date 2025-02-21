// src/hooks/useAdminNavigate.ts
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export const usePublicNavigate = () => {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();

  return (path: string) => {
    const publicPath = `/${currentLang}${path.startsWith('/') ? path : `/${path}`}`;
    navigate(publicPath);
  };
};