import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

interface AppLinkProps extends LinkProps {
  /**
   * Jeśli true – budujemy link do sekcji admin, czyli prefiksujemy ścieżkę jako:
   * /admin/:lang/...
   */
  admin?: boolean;
}

export const AppLink: React.FC<AppLinkProps> = ({ admin, to, ...rest }) => {
  const { currentLang } = useLanguage();

  let path = "";
  if (typeof to === "string") {
    if (admin) {
      // Dla admina: /admin/:lang/...
      path = `/admin/${currentLang}${to.startsWith("/") ? to : `/${to}`}`;
    } else {
      // Dla publicznych tras: /:lang/...
      path = `/${currentLang}${to.startsWith("/") ? to : `/${to}`}`;
    }
  } else {
    console.warn("AppLink nie obsługuje obiektu 'to' – użyj stringa");
  }

  return <Link to={path} {...rest} />;
};
