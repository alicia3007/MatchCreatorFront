"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  FileText,
  User,
  Star,
  LogOut,
  UserCircle,
  MessageSquare,
} from "lucide-react";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useUser } from "@/app/context/UserContext";

export default function CreatorSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
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
      label: t("creatorSidebar.menu.exploreCampaigns.label"),
      icon: Search,
      path: "/creator/campaigns",
      description: t("creatorSidebar.menu.exploreCampaigns.description"),
      badge: 0,
    },
    {
      label: t("creatorSidebar.menu.myApplications.label"),
      icon: FileText,
      path: "/creator/applications",
      description: t("creatorSidebar.menu.myApplications.description"),
      badge: 0,
    },
    {
      label: t("creatorSidebar.menu.messages.label"),
      icon: MessageSquare,
      path: "/creator/messages",
      description: t("creatorSidebar.menu.messages.description"),
      badge: unreadCount,
    },
    {
      label: t("creatorSidebar.menu.reviews.label"),
      icon: Star,
      path: "/creator/reviews",
      description: t("creatorSidebar.menu.reviews.description"),
      badge: 0,
    },
    {
      label: t("creatorSidebar.menu.myProfile.label"),
      icon: User,
      path: "/creator/profile",
      description: t("creatorSidebar.menu.myProfile.description"),
      badge: 0,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/logoma.png" alt="MatchCreator" style={{height: '36px', width: 'auto'}} />
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-full flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#1F2937] truncate">
              {(currentUser as any)?.name ||
                t("creatorSidebar.profile.defaultName")}
            </p>
            <p className="text-xs text-gray-500">
              {t("creatorSidebar.profile.role")}
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
                ? "bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <item.icon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isActive(item.path)
                  ? "text-white"
                  : "text-gray-500 group-hover:text-[#7C3AED]"
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
          <span className="font-medium text-sm">{t("creatorSidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}