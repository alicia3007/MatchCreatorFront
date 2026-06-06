"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useUser } from "../context/UserContext";
import { authService } from "../api";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowLeft,
  User,
  Building2,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setUserType, setCurrentUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByUserType = (userType: "creator" | "company") => {
    if (userType === "creator") {
      router.push("/creator/profile");
    } else {
      router.push("/company/profile");
    }
  };

  const handleQuickLogin = async (accountEmail: string) => {
    setError("");
    setLoading(true);

    const demoPassword = "Demo1234!";

    setEmail(accountEmail);
    setPassword(demoPassword);

    try {
      const response = await authService.login(accountEmail, demoPassword);

      setUserType(response.userType);
      setCurrentUser(response.profile);

      redirectByUserType(response.userType);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      setUserType(response.userType);
      setCurrentUser(response.profile);

      redirectByUserType(response.userType);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>

        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("common.back")}
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="bg-white rounded border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">
                  MatchCreator
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("login.title")}
              </h1>
              <p className="text-gray-600">{t("login.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("login.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("common.loading") : t("common.login")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t("login.noAccount")}{" "}
                <button
                  onClick={() => router.push("/")}
                  className="text-purple-600 font-semibold hover:text-purple-700"
                >
                  {t("login.signUp")}
                </button>
              </p>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-4">
            {/* Creator */}
            <div className="bg-white rounded border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {t("login.creatorAccount")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("login.creatorAccountDesc")}
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t("login.emailLabel")}
                  </span>
                  <code className="text-sm bg-white px-3 py-1 rounded border border-purple-200 text-purple-700 font-mono">
                    felipe.rodriguez@gmail.com
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t("login.passwordLabel")}
                  </span>
                  <code className="text-sm bg-white px-3 py-1 rounded border border-purple-200 text-purple-700 font-mono">
                    Demo1234!
                  </code>
                </div>
              </div>

              <button
                onClick={() => handleQuickLogin("felipe.rodriguez@gmail.com")}
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User className="w-5 h-5" />
                {t("login.quickLoginCreator")}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                {t("login.creatorFeatures")}
              </p>
            </div>

            {/* Company */}
            <div className="bg-white rounded border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {t("login.companyAccount")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("login.companyAccountDesc")}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t("login.emailLabel")}
                  </span>
                  <code className="text-sm bg-white px-3 py-1 rounded border border-blue-200 text-blue-700 font-mono">
                    contacto@kairolabs.co
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t("login.passwordLabel")}
                  </span>
                  <code className="text-sm bg-white px-3 py-1 rounded border border-blue-200 text-blue-700 font-mono">
                    Demo1234!
                  </code>
                </div>
              </div>

              <button
                onClick={() => handleQuickLogin("contacto@kairolabs.co")}
                disabled={loading}
                className="w-full py-3 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Building2 className="w-5 h-5" />
                {t("login.quickLoginCompany")}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                {t("login.companyFeatures")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}