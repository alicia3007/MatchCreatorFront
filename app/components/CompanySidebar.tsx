"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Plus,
  Briefcase,
  Star,
  LogOut,
  Building2,
} from "lucide-react";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useUser } from "@/app/context/UserContext";

export default function CompanySidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { setUserType, setCurrentUser, currentUser, conversations } = useUser();

  const handleLogout = () => {
    setUserType(null);
    setCurrentUser(null);
    router.push("/");
  };

  const unreadCount = conversations.reduce((sum, conv) => {
    if (!currentUser) return sum;
    return sum + (conv.unreadByUser[currentUser.id] ?? 0);
  }, 0);

  const menuItems = [
    {
      label: t("companySidebar.menu.profile.label"),
      icon: LayoutDashboard,
      path: "/company/profile",
      description: t("companySidebar.menu.profile.description"),
      badge: 0,
    },
    {
      label: t("companySidebar.menu.browseCreators.label"),
      icon: Search,
      path: "/company/creators",
      description: t("companySidebar.menu.browseCreators.description"),
      badge: 0,
    },
    {
      label: t("companySidebar.menu.messages.label"),
      icon: MessageSquare,
      path: "/company/messages",
      description: t("companySidebar.menu.messages.description"),
      badge: unreadCount,
    },
    {
      label: t("companySidebar.menu.createCampaign.label"),
      icon: Plus,
      path: "/company/campaigns/new",
      description: t("companySidebar.menu.createCampaign.description"),
      badge: 0,
    },
    {
      label: t("companySidebar.menu.myCampaigns.label"),
      icon: Briefcase,
      path: "/company/campaigns",
      description: t("companySidebar.menu.myCampaigns.description"),
      badge: 0,
    },
    {
      label: t("companySidebar.menu.reviews.label"),
      icon: Star,
      path: "/company/reviews",
      description: t("companySidebar.menu.reviews.description"),
      badge: 0,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image
            src="/logoma.png"
            alt="MatchCreator"
            width={180}
            height={36}
            style={{ height: "36px", width: "auto" }}
          />
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#1F2937] truncate">
              {currentUser?.name ||
                t("companySidebar.profile.defaultName")}
            </p>
            <p className="text-xs text-gray-500">
              {t("companySidebar.profile.role")}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all group relative ${
              isActive(item.path)
                ? "bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <item.icon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isActive(item.path)
                  ? "text-white"
                  : "text-gray-500 group-hover:text-[#0EA5E9]"
              }`}
            />
            <div className="text-left flex-1 min-w-0">
              <p
                className={`font-medium text-sm ${
                  isActive(item.path) ? "text-white" : "text-[#1F2937]"
                }`}
              >
                {item.label}
              </p>
              <p
                className={`text-xs ${
                  isActive(item.path) ? "text-white/80" : "text-gray-500"
                }`}
              >
                {item.description}
              </p>
            </div>
            {item.badge > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <LanguageSwitcher />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">{t("companySidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}