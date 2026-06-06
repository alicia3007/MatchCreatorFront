"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Sincroniza el atributo lang del <html> con el idioma actual de i18n
 */
export default function HtmlLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return null;
}