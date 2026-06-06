"use client";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t("notFound.title")}
        </h2>
        <p className="text-gray-600 mb-8">
          {t("notFound.subtitle")}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          {t("notFound.backHome")}
        </button>
      </div>
    </div>
  );
}