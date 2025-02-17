/* eslint-disable @typescript-eslint/no-empty-object-type */
// src/components/LanguageWrapper.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadCatalog } from "../../utils/i18n";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";

const LanguageWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { lang } = useParams<{ lang: string }>();
  useEffect(() => {
    loadCatalog(lang || "en");
  }, [lang]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
};

export default LanguageWrapper;
