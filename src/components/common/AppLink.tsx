// src/components/AppLink.tsx
import React from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

interface AppLinkProps extends LinkProps {
  admin?: boolean;
  forcePublic?: boolean;
}

export const AppLink: React.FC<AppLinkProps> = ({ 
  admin, 
  forcePublic,
  to, 
  ...rest 
}) => {
  const { currentLang } = useLanguage();
  const location = useLocation();
  
  const isInAdminSection = location.pathname.includes('/admin/');
  const shouldBeAdmin = admin || (isInAdminSection && !forcePublic);

  let path = "";
  if (typeof to === "string") {
    const cleanPath = to.replace(/^\/?(admin\/)?[a-z]{2}\//, '');
    
    if (shouldBeAdmin) {
      path = `/admin/${currentLang}/${cleanPath}`.replace(/\/+/g, '/');
    } else {
      path = `/${currentLang}/${cleanPath}`.replace(/\/+/g, '/');
    }
    
    if (to === '/') {
      path = shouldBeAdmin ? `/admin/${currentLang}` : `/${currentLang}`;
    }
  } else {
    console.warn("AppLink nie obsługuje obiektu 'to' – użyj stringa");
  }

  return <Link to={path} {...rest} />;
};