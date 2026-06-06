"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useUser,
  Creator,
  Company,
  Campaign,
  Application,
  MATCH_CREATOR_SYSTEM,
} from "../context/UserContext";
import { useTranslation } from "react-i18next";
import CompanySidebar from "../components/CompanySidebar";
import {
  Building2, DollarSign, Calendar, ArrowLeft, Users, Edit,
  CheckCircle, XCircle, TrendingUp, Eye, ListChecks,
  Package, ImageIcon, Loader2, Star,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  campaignsService,
  applicationsService,
  creatorsService,
} from "../api";

const getPlatformColors = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white";
  if (p.includes("youtube")) return "bg-[#FF0000] text-white";
  if (p.includes("tiktok")) return "bg-black text-white";
  if (p.includes("twitter") || p.includes("x")) return "bg-black text-white";
  if (p.includes("facebook")) return "bg-[#1877F2] text-white";
  if (p.includes("twitch")) return "bg-[#9146FF] text-white";
  if (p.includes("linkedin")) return "bg-[#0A66C2] text-white";
  if (p.includes("pinterest")) return "bg-[#E60023] text-white";
  if (p.includes("snapchat")) return "bg-[#FFFC00] text-black";
  if (p.includes("podcast")) return "bg-[#8940FA] text-white";
  return "bg-[#0EA5E9] text-white";
};

const PlatformLogo = ({ platform, size = 22 }: { platform: string; size?: number }) => {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
  if (p.includes("youtube")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
  if (p.includes("tiktok")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
};

export default function CompanyCampaignDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const {
    addMessage, addNotification, getOrCreateConversation,
    currentUser, addConversation, conversations, userType,
  } = useUser();

  const [selectedTab, setSelectedTab] = useState<"overview" | "applicants">("overview");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaignApplications, setCampaignApplications] = useState<Application[]>([]);
  const [creatorsById, setCreatorsById] = useState<Record<string, Creator>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [campaignData, applicationsData] = await Promise.all([
        campaignsService.getById(id),
        applicationsService.getByCampaign(id),
      ]);
      setCampaign(campaignData);
      setCampaignApplications(applicationsData);

      const uniqueCreatorIds = Array.from(new Set(applicationsData.map((a: Application) => a.creatorId)));
      const creatorResults = await Promise.allSettled(
        uniqueCreatorIds.map((creatorId) => creatorsService.getById(creatorId as string)),
      );
      const nextCreatorsById: Record<string, Creator> = {};
      creatorResults.forEach((result) => {
        if (result.status === "fulfilled") {
          nextCreatorsById[result.value.id] = result.value;
        }
      });
      setCreatorsById(nextCreatorsById);
    } catch (error) {
      console.error("Error al cargar campaña:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanySidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-14 text-center">
            <Loader2 className="w-12 h-12 text-[#0EA5E9] mx-auto mb-4 animate-spin" />
            <p className="text-sm text-gray-600 font-medium">{t("common.loading")}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanySidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <p className="text-center text-gray-600">{t("companyCampaignDetail.notFound")}</p>
        </main>
      </div>
    );
  }

  const handleCloseCampaign = async () => {
    if (confirm(t("companyCampaignDetail.confirmClose"))) {
      try {
        await campaignsService.updateStatus(campaign.id, "closed");
        setCampaign((prev) => prev ? { ...prev, status: "closed" } : prev);
      } catch (error) {
        console.error("Error al cerrar campaña:", error);
      }
    }
  };

  const handleEditCampaign = () => {
    router.push(`/company/campaigns/new?campaignId=${campaign.id}`);
  };

  const getOrCreateSystemConversation = (creatorId: string, creatorName: string, creatorAvatar: string) => {
    const existing = conversations.find(
      (conv) => conv.participants.some((p) => p.id === creatorId) && conv.participants.some((p) => p.id === MATCH_CREATOR_SYSTEM.id),
    );
    if (existing) return existing;
    const newConv = {
      id: `conv-system-creator-${creatorId}-${Date.now()}`,
      participants: [
        { id: creatorId, name: creatorName, avatar: creatorAvatar, type: "creator" as const },
        { ...MATCH_CREATOR_SYSTEM },
      ],
      lastMessage: undefined,
      unreadCount: 0,
      unreadByUser: { [creatorId]: 1 },
    };
    addConversation(newConv);
    return newConv;
  };

  const handleAcceptApplication = async (appId: string) => {
    const application = campaignApplications.find((a) => a.id === appId);
    if (!application || !currentUser) return;
    const creator = creatorsById[application.creatorId];
    if (!creator) return;

    try {
      await applicationsService.updateStatus(appId, "accepted");
      setCampaignApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: "accepted" as const } : a),
      );

      const currentUserAsCompany = currentUser as Company;
      const conversation = getOrCreateConversation(
        currentUser.id,
        userType as "creator" | "company",
        creator.id,
        "creator",
      );
      addConversation({
        ...conversation,
        participants: [
          { id: currentUser.id, name: currentUser.name, avatar: currentUserAsCompany.logo || "", type: userType as "creator" | "company" },
          { id: creator.id, name: creator.name, avatar: creator.avatar, type: "creator" as const },
        ],
        unreadByUser: { [creator.id]: 1, [currentUser.id]: 0 },
      });
      addMessage({ id: `msg-company-${Date.now()}`, conversationId: conversation.id, senderId: currentUser.id, senderName: currentUser.name, senderAvatar: currentUserAsCompany.logo || "", text: t("companyCampaignDetail.messages.acceptedCompany", { creatorName: creator.name, campaignName: campaign.name }), timestamp: new Date().toISOString(), read: false });
      const systemConversation = getOrCreateSystemConversation(creator.id, creator.name, creator.avatar);
      addMessage({ id: `msg-system-${Date.now()}`, conversationId: systemConversation.id, senderId: MATCH_CREATOR_SYSTEM.id, senderName: MATCH_CREATOR_SYSTEM.name, senderAvatar: MATCH_CREATOR_SYSTEM.avatar, text: t("companyCampaignDetail.messages.acceptedSystem", { campaignName: campaign.name, companyName: campaign.companyName }), timestamp: new Date().toISOString(), read: false });
      addNotification({ id: `notif-${Date.now()}`, userId: creator.id, type: "accepted", title: t("companyCampaignDetail.notifications.acceptedTitle"), message: t("companyCampaignDetail.notifications.acceptedMessage", { campaignName: campaign.name }), campaignId: campaign.id, campaignName: campaign.name, read: false, timestamp: new Date().toISOString() });
      router.push(`/company/messages?conversationId=${conversation.id}`);
    } catch (error) {
      console.error("Error al aceptar aplicación:", error);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    if (!confirm(t("companyCampaignDetail.confirmReject"))) return;
    const application = campaignApplications.find((a) => a.id === appId);
    if (!application) return;
    const creator = creatorsById[application.creatorId];
    if (!creator) return;

    try {
      await applicationsService.updateStatus(appId, "rejected");
      setCampaignApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: "rejected" as const } : a),
      );
      const systemConversation = getOrCreateSystemConversation(creator.id, creator.name, creator.avatar);
      addMessage({ id: `msg-system-${Date.now()}`, conversationId: systemConversation.id, senderId: MATCH_CREATOR_SYSTEM.id, senderName: MATCH_CREATOR_SYSTEM.name, senderAvatar: MATCH_CREATOR_SYSTEM.avatar, text: t("companyCampaignDetail.messages.rejectedSystem", { campaignName: campaign.name, companyName: campaign.companyName }), timestamp: new Date().toISOString(), read: false });
      addNotification({ id: `notif-${Date.now()}`, userId: creator.id, type: "rejected", title: t("companyCampaignDetail.notifications.rejectedTitle"), message: t("companyCampaignDetail.notifications.rejectedMessage", { campaignName: campaign.name }), campaignId: campaign.id, campaignName: campaign.name, read: false, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error al rechazar aplicación:", error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "sent": return "bg-blue-100 text-blue-700";
      case "reviewing": return "bg-yellow-100 text-yellow-700";
      case "accepted": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => t(`applications.status.${status}`, { defaultValue: status });

  const c = campaign as unknown as Record<string, unknown>;
  const categories: string[] = (c.categories as string[]) || campaign.creatorType || [];
  const platforms: string[] = campaign.socialPlatform || [];
  const requirements: { id?: string; text?: string }[] = (c.requirements_list as { id?: string; text?: string }[]) || (Array.isArray(campaign.requirements) ? campaign.requirements.map((r, i) => ({ id: `r${i}`, text: r })) : []);
  const deliverables: { id?: string; text?: string }[] = (c.deliverables as { id?: string; text?: string }[]) || [];
  const mainImage: string | null = campaign.mainImage || null;
  const bannerImage: string | null = campaign.bannerImage || null;
  const acceptedCount = campaignApplications.filter((a) => a.status === "accepted").length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CompanySidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => router.push("/company/campaigns")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#0EA5E9] transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("companyCampaignDetail.backToCampaigns")}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleEditCampaign}
                className="px-3 py-1.5 rounded-xl bg-sky-50 text-[#0EA5E9] hover:bg-sky-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Edit className="w-3.5 h-3.5" />{t("common.edit")}
              </button>
              {campaign.status === "active" && (
                <button
                  onClick={handleCloseCampaign}
                  className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                >
                  {t("companyCampaignDetail.closeCampaign")}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Hero card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5">
            <div className="h-44 relative overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8]">
              {bannerImage ? (
                <Image src={bannerImage} alt="Banner" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <ImageIcon className="w-24 h-24 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
              <div className={`absolute top-3 right-3 px-4 py-2 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-1.5 ${campaign.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === "active" ? "bg-white animate-pulse" : "bg-gray-300"}`} />
                {campaign.status === "active" ? t("companyCampaignDetail.statusActive") : t("companyCampaignDetail.statusClosed")}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-5 mb-5">
                {mainImage && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0 -mt-16 relative z-10 bg-white">
                    <Image src={mainImage} alt="Campaign" fill className="object-cover" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-black text-[#1F2937] mb-1.5">{campaign.name}</h1>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-xl flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{t("companyCampaignDetail.yourCompany")}</p>
                      <p className="text-base font-bold text-[#0EA5E9]">{campaign.companyName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] text-white rounded-2xl p-4 shadow-lg hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
                    <p className="text-xl font-black">{campaign.budget}</p>
                  </div>
                  <p className="text-xs font-semibold text-white/90">{t("companyCampaignDetail.stats.budget")}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Users className="w-4 h-4" /></div>
                    <p className="text-xl font-black">{campaignApplications.length}</p>
                  </div>
                  <p className="text-xs font-semibold text-white/90">{t("companyCampaignDetail.stats.applications")}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-4 shadow-lg hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                    <p className="text-xs font-black leading-tight">
                      {new Date(campaign.startDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                      {" – "}
                      {new Date(campaign.endDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-white/90">{t("companyCampaignDetail.stats.duration")}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-full text-xs font-bold shadow hover:scale-105 transition-transform">{cat}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 border-b border-gray-200">
            <div className="flex gap-2">
              {(["overview", "applicants"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-5 py-2.5 font-semibold text-sm transition-all flex items-center gap-2 ${selectedTab === tab ? "text-[#0EA5E9] border-b-2 border-[#0EA5E9]" : "text-gray-500 hover:text-gray-800"}`}
                >
                  {tab === "overview" ? t("companyCampaignDetail.tabs.overview") : t("companyCampaignDetail.tabs.applicants")}
                  {tab === "applicants" && campaignApplications.length > 0 && (
                    <span className="px-2 py-0.5 bg-[#0EA5E9] text-white text-xs font-bold rounded-full">{campaignApplications.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Overview tab */}
          {selectedTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-5">

                <div className="bg-white rounded-2xl shadow-lg p-5">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#1F2937]">
                    <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center"><Package className="w-4 h-4 text-[#0EA5E9]" /></div>
                    {t("companyCampaignDetail.overview.description")}
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed">{campaign.description}</p>
                </div>

                {/* Plataformas */}
                <div className="bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-2xl shadow-xl p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2.5 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div>
                    {t("companyCampaignDetail.overview.platforms")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {platforms.map((platform, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border-2 border-white/40 hover:border-white transition-all hover:shadow-xl hover:scale-105">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow ${getPlatformColors(platform)}`}>
                            <PlatformLogo platform={platform} size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-[#1F2937] text-sm">{platform}</p>
                            <p className="text-xs text-gray-500">{t("companyCampaignDetail.overview.publishChannel")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {deliverables.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-5">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#1F2937]">
                      <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center"><ListChecks className="w-4 h-4 text-[#0EA5E9]" /></div>
                      {t("companyCampaignDetail.overview.deliverables")}
                    </h2>
                    <div className="space-y-2.5">
                      {deliverables.map((d, i) => (
                        <div key={d.id || i} className="p-3 bg-sky-50 rounded-xl border-l-4 border-[#0EA5E9] flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-gray-700 text-sm leading-relaxed">{d.text ?? String(d)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-5 text-white">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                    {t("companyCampaignDetail.overview.selectionSummary")}
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: campaignApplications.length, label: t("companyCampaignDetail.overview.totalApplications") },
                      { value: acceptedCount, label: t("companyCampaignDetail.overview.accepted") },
                      { value: campaignApplications.filter((a) => a.status === "sent").length, label: t("companyCampaignDetail.overview.pending") },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/20 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black">{item.value}</p>
                        <p className="text-xs text-white/80 mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {requirements.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-5">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-[#1F2937]">
                      <CheckCircle className="w-4 h-4 text-[#0EA5E9]" />{t("companyCampaignDetail.overview.requirements")}
                    </h3>
                    <ul className="space-y-2.5">
                      {requirements.map((req, i) => (
                        <li key={req.id || i} className="flex items-start gap-2.5 group">
                          <div className="w-5 h-5 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-3.5 h-3.5 text-[#0EA5E9]" />
                          </div>
                          <span className="text-gray-700 text-sm leading-relaxed">{req.text ?? String(req)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg p-5">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-[#1F2937]">
                    <Calendar className="w-4 h-4 text-[#0EA5E9]" />{t("companyCampaignDetail.overview.timeline")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                      <span className="text-xs text-gray-600">{t("companyCampaignDetail.overview.startDate")}</span>
                      <span className="text-xs font-semibold text-gray-900">{new Date(campaign.startDate).toLocaleDateString("es-ES")}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-sky-50 rounded-xl border border-sky-100">
                      <span className="text-xs text-sky-700">{t("companyCampaignDetail.overview.endDate")}</span>
                      <span className="text-xs font-semibold text-sky-900">{new Date(campaign.endDate).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-sky-900 mb-1.5 text-sm">{t("companyCampaignDetail.editHint.title")}</h3>
                  <p className="text-xs text-sky-700 mb-3">{t("companyCampaignDetail.editHint.subtitle")}</p>
                  <button
                    onClick={handleEditCampaign}
                    className="w-full py-2.5 rounded-xl bg-[#0EA5E9] text-white font-semibold text-xs hover:bg-[#0EA5E9]/90 transition-all shadow flex items-center justify-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5" />{t("companyCampaignDetail.editHint.button")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Applicants tab */}
          {selectedTab === "applicants" && (
            <div className="space-y-3">
              {campaignApplications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-14 text-center">
                  <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{t("companyCampaignDetail.applicants.empty.title")}</h3>
                  <p className="text-gray-500 text-sm">{t("companyCampaignDetail.applicants.empty.subtitle")}</p>
                </div>
              ) : (
                campaignApplications.map((application) => {
                  const creator = creatorsById[application.creatorId];
                  if (!creator) return null;
                  return (
                    <div key={application.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                      <div className="p-5 flex items-start gap-4">
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                              <h3 className="text-base font-bold text-gray-900">{creator.name}</h3>
                              <p className="text-xs text-[#0EA5E9] font-medium">{creator.publicName}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${getStatusStyle(application.status)}`}>
                              {getStatusText(application.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{creator.bio}</p>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="p-2.5 bg-sky-50 rounded-xl">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Users className="w-3.5 h-3.5 text-[#0EA5E9]" />
                                <span className="text-[10px] font-medium text-gray-500">{t("companyCampaignDetail.applicants.card.followers")}</span>
                              </div>
                              <p className="text-base font-black text-[#0EA5E9]">{creator.socialMedia.reduce((acc, sm) => acc + sm.followers, 0).toLocaleString()}</p>
                            </div>
                            <div className="p-2.5 bg-violet-50 rounded-xl">
                              <div className="flex items-center gap-1 mb-0.5">
                                <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                                <span className="text-[10px] font-medium text-gray-500">{t("companyCampaignDetail.applicants.card.networks")}</span>
                              </div>
                              <p className="text-base font-black text-violet-600">{creator.socialMedia?.length || 0}</p>
                            </div>
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[10px] font-medium text-gray-500">{t("companyCampaignDetail.applicants.card.rating")}</span>
                              </div>
                              <p className="text-base font-black text-amber-600">{creator.rating > 0 ? creator.rating.toFixed(1) : t("companyCampaignDetail.applicants.card.newCreator")}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {creator.socialMedia?.map((sm, i) => (
                              <div key={i} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                {sm.platform} <span className="text-gray-400">({sm.followers.toLocaleString()})</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {creator.contentType?.map((type, i) => (
                              <span key={i} className="px-2.5 py-0.5 bg-sky-100 text-[#0EA5E9] rounded-full text-xs font-semibold">{type}</span>
                            ))}
                          </div>

                          <p className="text-xs text-gray-400">
                            {t("companyCampaignDetail.applicants.card.appliedOn")} {new Date(application.appliedDate).toLocaleDateString("es-ES")}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => router.push(`/company/creators/${creator.id}`)}
                            className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />{t("companyCampaignDetail.applicants.card.viewProfile")}
                          </button>
                          {application.status === "sent" && (
                            <>
                              <button
                                onClick={() => handleAcceptApplication(application.id)}
                                className="px-3.5 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />{t("campaigns.accept")}
                              </button>
                              <button
                                onClick={() => handleRejectApplication(application.id)}
                                className="px-3.5 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                              >
                                <XCircle className="w-3.5 h-3.5" />{t("campaigns.reject")}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}