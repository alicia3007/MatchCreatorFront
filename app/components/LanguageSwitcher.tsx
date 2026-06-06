"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";


const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLangCode = i18n.language.startsWith("es") ? "es" : "en";
  const currentLanguage =
    languages.find((lang) => lang.code === currentLangCode) || languages[0];

  const changeLanguage = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all border border-gray-200"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <p className="font-medium text-sm text-gray-900">
                {currentLanguage.flag} {currentLanguage.name}
              </p>
              <p className="text-xs text-gray-500">Idioma / Language</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-56 bg-white border border-gray-200 shadow-lg z-[9999]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 ${
              currentLangCode === lang.code
                ? "bg-purple-50 text-purple-700"
                : "hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
            {currentLangCode === lang.code && (
              <span className="ml-auto text-purple-600 font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}