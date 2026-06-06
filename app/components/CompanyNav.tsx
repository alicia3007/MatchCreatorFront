"use client";

import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { Home, Users, Plus, Briefcase, Star, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function CompanyNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { setUserType, setCurrentUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    setUserType(null);
    setCurrentUser(null);
    router.push("/");
  };

  const menuItems = [
    { label: t("nav.profile"), icon: Home, path: "/company/profile" },
    { label: t("nav.browseCreators"), icon: Users, path: "/company/creators" },
    { label: t("nav.create"), icon: Plus, path: "/company/campaigns/new" },
    { label: t("nav.myCampaigns"), icon: Briefcase, path: "/company/campaigns" },
    { label: t("nav.reviews"), icon: Star, path: "/company/reviews" },
  ];

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:block bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">MatchCreator</span>
            <div className="flex items-center gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    pathname === item.path
                      ? "bg-white/20 font-semibold"
                      : "hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                {t("common.logout")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile */}
      <nav className="md:hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">MatchCreator</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/20 px-4 py-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  pathname === item.path
                    ? "bg-white/20 font-semibold"
                    : "hover:bg-white/10"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              {t("common.logout")}
            </button>
          </div>
        )}
      </nav>
    </>
  );
}