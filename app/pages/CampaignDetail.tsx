"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "../context/UserContext";
import type { Campaign, Creator } from "../context/UserContext";
import CreatorSidebar from "../components/CreatorSidebar";
import {
  ArrowLeft,
  Sparkles,
  Building2,
  DollarSign,
  Calendar,
  Target,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  ListChecks,
  Package,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  campaignsService,
  applicationsService,
} from "../api";

interface ContentRequirement {
  quantity: string | number;
  type: string;
  duration?: string | number | null;
}

interface TextListItemObject {
  id?: string | number;
  text?: string;
}

type TextListItem = string | TextListItemObject;

type MinFollowers = Record<
  string,
  string | number | null | undefined
>;

interface CampaignWithExtras extends Campaign {
  deliverables?: TextListItem[] | null;
  requirements_list?: TextListItem[] | null;
  mensajeClave?: string | null;
  publicoObjetivo?: string | null;
  callToAction?: string | null;
  contentRequirements?: ContentRequirement[] | null;
  minEngagement?: string | number | null;
  location?: string | null;
  quantity?: string | number | null;
  minFollowers?: MinFollowers | null;
  deliveryDeadline?: string | null;
  budgetPerCreator?: string | number | null;
  paymentType?: string | null;
}

const getTextListItemKey = (
  item: TextListItem,
  index: number,
): string | number => {
  if (typeof item === "string") {
    return index;
  }

  return item.id ?? index;
};

const getTextListItemValue = (
  item: TextListItem,
): string => {
  if (typeof item === "string") {
    return item;
  }

  return item.text ?? "";
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const navigate = (href: string) => router.push(href);
  const { currentUser, isLoadingUser } = useUser();
  const { t, i18n } = useTranslation();

  const [campaign, setCampaign] = useState<Campaign | null>(
    null,
  );
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const creator = currentUser as Creator | null;
  const creatorId = creator?.id;

  useEffect(() => {
    if (!id) return;

    const loadCampaign = async () => {
      setLoading(true);

      try {
        const data = await campaignsService.getById(id);
        setCampaign(data);
      } catch (error: unknown) {
        console.error("Error al cargar campaña:", error);
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCampaign();
  }, [id]);

  useEffect(() => {
    if (isLoadingUser) return;

    if (!id || !creatorId) {
      setHasApplied(false);
      return;
    }

    const checkIfApplied = async () => {
      try {
        const applications = await applicationsService.getMine();

        const applied = applications.some(
          (application) => application.campaignId === id,
        );

        setHasApplied(applied);
      } catch (error: unknown) {
        console.error("Error al verificar aplicación:", error);
      }
    };

    void checkIfApplied();
  }, [id, creatorId, isLoadingUser]);

  const handleApply = async () => {
    if (!creator || !campaign || !id) return;

    setApplying(true);

    try {
      await applicationsService.create({
        campaignId: id,
        creatorId: creator.id,
        creatorName: creator.name,
      });

      setHasApplied(true);
    } catch (error: unknown) {
      console.error("Error al aplicar:", error);
    } finally {
      setApplying(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();

    if (p.includes("instagram")) {
      return <Instagram className="w-5 h-5" />;
    }

    if (p.includes("youtube")) {
      return <Youtube className="w-5 h-5" />;
    }

    if (p.includes("tiktok")) {
      return <span className="font-bold text-sm">TT</span>;
    }

    if (p.includes("twitter") || p.includes("x.com")) {
      return <Twitter className="w-5 h-5" />;
    }

    if (p.includes("facebook")) {
      return <Facebook className="w-5 h-5" />;
    }

    if (p.includes("twitch")) {
      return <span className="font-bold text-sm">TW</span>;
    }

    return <TrendingUp className="w-5 h-5" />;
  };

  const getPlatformColors = (platform: string) => {
    const p = platform.toLowerCase();

    if (p.includes("instagram")) {
      return {
        bg: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
        text: "text-white",
        border: "border-[#ee2a7b]",
      };
    }

    if (p.includes("youtube")) {
      return {
        bg: "bg-[#FF0000]",
        text: "text-white",
        border: "border-[#FF0000]",
      };
    }

    if (p.includes("tiktok")) {
      return {
        bg: "bg-black",
        text: "text-white",
        border: "border-black",
      };
    }

    if (p.includes("twitter") || p.includes("x.com")) {
      return {
        bg: "bg-black",
        text: "text-white",
        border: "border-black",
      };
    }

    if (p.includes("facebook")) {
      return {
        bg: "bg-[#1877F2]",
        text: "text-white",
        border: "border-[#1877F2]",
      };
    }

    if (p.includes("twitch")) {
      return {
        bg: "bg-[#9146FF]",
        text: "text-white",
        border: "border-[#9146FF]",
      };
    }

    return {
      bg: "bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]",
      text: "text-white",
      border: "border-[#7C3AED]",
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F3F4F6]">
        <CreatorSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="w-12 h-12 text-[#7C3AED] mx-auto mb-4 animate-spin" />
            <p className="text-center text-gray-600">
              {t("common.loading")}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen bg-[#F3F4F6]">
        <CreatorSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <p className="text-center text-gray-600">
            {t("campaignDetail.notFound")}
          </p>
        </main>
      </div>
    );
  }

  const c = campaign as CampaignWithExtras;
  const deliverables = c.deliverables ?? [];
  const requirements_list = c.requirements_list ?? [];
  const bannerImage: string | null =
    campaign.bannerImage || null;
  const mainImage: string | null = campaign.mainImage || null;

  const purpleShades = [
    "bg-purple-50 border-purple-500",
    "bg-violet-50 border-violet-500",
    "bg-fuchsia-50 border-fuchsia-500",
    "bg-indigo-50 border-indigo-500",
  ];

  const purpleIconColors = [
    "text-purple-600",
    "text-violet-600",
    "text-fuchsia-600",
    "text-indigo-600",
  ];

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <CreatorSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header con navegación */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <button
              onClick={() => navigate("/creator/campaigns")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#7C3AED] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">
                {t("campaignDetail.backToCampaigns")}
              </span>
            </button>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Campaign Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Cover image */}
            <div className="h-56 relative overflow-hidden bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
              {bannerImage && (
                <Image
                  src={bannerImage}
                  alt={t("campaignDetail.coverAlt")}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

              <div className="absolute top-4 right-4 px-5 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm shadow-2xl flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                {t("campaignDetail.activeCampaign")}
              </div>
            </div>

            {/* Campaign info section */}
            <div className="p-8">
              <div className="mb-4">
                <h1 className="text-4xl font-black text-[#1F2937] mb-3">
                  {campaign.name}
                </h1>

                <div
                  onClick={() =>
                    navigate(
                      `/creator/companies/${campaign.companyId}`,
                    )
                  }
                  className="flex items-center gap-3 mb-4 cursor-pointer group w-fit"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {t("campaignDetail.organizedBy")}
                    </p>
                    <p className="text-xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent group-hover:underline">
                      {campaign.companyName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-black">
                      {campaign.budget}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    {t("campaignDetail.paymentOffered")}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-black">
                      {campaign.applicants?.length || 0}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    {t("campaigns.applicants")}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-black">
                      {new Date(
                        campaign.startDate,
                      ).toLocaleDateString(
                        i18n.language?.startsWith("es")
                          ? "es-ES"
                          : "en-US",
                        { day: "2-digit", month: "short" },
                      )}
                      {" - "}
                      {new Date(
                        campaign.endDate,
                      ).toLocaleDateString(
                        i18n.language?.startsWith("es")
                          ? "es-ES"
                          : "en-US",
                        { day: "2-digit", month: "short" },
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    {t("campaignDetail.duration")}
                  </p>
                </div>
              </div>

              {/* Tags de tipo de creador */}
              <div className="flex flex-wrap gap-2">
                {campaign.creatorType.map((type, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              {/* Descripción */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  {t("campaignDetail.campaignDescription")}
                </h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {campaign.description}
                </p>
              </div>

              {/* Brief completo */}
              {(c.mensajeClave ||
                c.publicoObjetivo ||
                c.callToAction) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                    <Target className="w-5 h-5 text-purple-600" />
                    {t("campaignDetail.campaignBrief")}
                  </h2>
                  <div className="space-y-3">
                    {c.mensajeClave && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          {t("campaignDetail.keyMessage")}
                        </p>
                        <p className="text-gray-900">
                          {c.mensajeClave}
                        </p>
                      </div>
                    )}

                    {c.publicoObjetivo && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          {t("campaignDetail.targetAudience")}
                        </p>
                        <p className="text-gray-900">
                          {c.publicoObjetivo}
                        </p>
                      </div>
                    )}

                    {c.callToAction && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          {t("campaignDetail.callToAction")}
                        </p>
                        <p className="text-gray-900 font-semibold text-purple-600">
                          {c.callToAction}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Objetivo */}
              {campaign.objective && (
                <div className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    {t("campaignDetail.collaborationObjective")}
                  </h2>
                  <p className="text-white/95 leading-relaxed text-base">
                    {campaign.objective}
                  </p>
                </div>
              )}

              {/* Contenido Requerido */}
              {c.contentRequirements &&
                c.contentRequirements.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                      <ListChecks className="w-5 h-5 text-purple-600" />
                      {t("campaignDetail.requiredContent")}
                    </h2>
                    <div className="space-y-2">
                      {c.contentRequirements.map(
                        (content, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                          >
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            <div>
                              <span className="font-semibold text-gray-900">
                                {content.quantity}x{" "}
                                {content.type}
                              </span>
                              {content.duration && (
                                <span className="text-gray-600 ml-2">
                                  ({content.duration})
                                </span>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Requisitos de Creadores */}
              {(c.minEngagement ||
                c.location ||
                c.quantity) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                    <Users className="w-5 h-5 text-purple-600" />
                    {t("campaignDetail.creatorRequirements")}
                  </h2>
                  <div className="space-y-3">
                    {c.minEngagement && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">
                          {t("campaignDetail.minEngagement")}{" "}
                          <span className="font-semibold">
                            {c.minEngagement}%
                          </span>
                        </span>
                      </div>
                    )}

                    {c.quantity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">
                          {t("campaignDetail.creatorsNeeded")}{" "}
                          <span className="font-semibold">
                            {c.quantity}
                          </span>
                        </span>
                      </div>
                    )}

                    {c.location && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">
                          {t("campaignDetail.location")}{" "}
                          <span className="font-semibold">
                            {c.location}
                          </span>
                        </span>
                      </div>
                    )}

                    {c.minFollowers &&
                      Object.keys(c.minFollowers).length >
                        0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            {t(
                              "campaignDetail.minFollowersByPlatform",
                            )}
                          </p>
                          <div className="space-y-1">
                            {Object.entries(c.minFollowers).map(
                              ([platform, followers]) =>
                                followers && (
                                  <div
                                    key={platform}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {platform}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      {Number(
                                        followers,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Timeline extendido */}
              {c.deliveryDeadline && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    {t("campaignDetail.detailedTimeline")}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">
                        {t("campaignDetail.campaignStart")}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(
                          campaign.startDate,
                        ).toLocaleDateString(
                          i18n.language?.startsWith("es")
                            ? "es-ES"
                            : "en-US",
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">
                        {t("campaignDetail.campaignEnd")}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(
                          campaign.endDate,
                        ).toLocaleDateString(
                          i18n.language?.startsWith("es")
                            ? "es-ES"
                            : "en-US",
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-purple-700 font-medium">
                        {t("campaignDetail.deliveryDeadline")}
                      </span>
                      <span className="font-semibold text-purple-900">
                        {new Date(
                          c.deliveryDeadline,
                        ).toLocaleDateString(
                          i18n.language?.startsWith("es")
                            ? "es-ES"
                            : "en-US",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Presupuesto extendido */}
              {(c.budgetPerCreator || c.paymentType) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    {t("campaignDetail.paymentInformation")}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">
                        {t("campaignDetail.totalBudget")}
                      </span>
                      <span className="font-bold text-gray-900">
                        {campaign.budget}
                      </span>
                    </div>

                    {c.budgetPerCreator && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700">
                          {t("campaignDetail.perCreator")}
                        </span>
                        <span className="font-bold text-purple-900">
                          {c.budgetPerCreator}
                        </span>
                      </div>
                    )}

                    {c.paymentType && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700">
                          {t("campaignDetail.paymentType")}
                        </span>
                        <span className="font-semibold text-blue-900">
                          {c.paymentType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Plataformas */}
              <div className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  {t("campaignDetail.requiredPlatforms")}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {campaign.socialPlatform.map(
                    (platform, index) => {
                      const colors =
                        getPlatformColors(platform);

                      return (
                        <div
                          key={index}
                          className="group p-5 bg-white rounded-xl border-2 border-white/50 hover:border-white transition-all hover:shadow-xl transform hover:scale-105"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} shadow-lg group-hover:shadow-xl transition-all`}
                            >
                              {getPlatformIcon(platform)}
                            </div>

                            <div className="flex-1">
                              <p className="font-bold text-[#1F2937] text-lg">
                                {platform}
                              </p>
                              <p className="text-sm text-gray-500">
                                {t(
                                  "campaignDetail.requiredForCampaign",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Qué necesitas hacer */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
                    <ListChecks className="w-5 h-5 text-purple-600" />
                  </div>
                  {t("campaignDetail.whatYouNeedToDo")}
                </h2>

                {deliverables.length > 0 ? (
                  <div className="space-y-3">
                    {deliverables.map(
                      (d, index) => {
                        const shade =
                          purpleShades[
                            index % purpleShades.length
                          ];
                        const iconColor =
                          purpleIconColors[
                            index % purpleIconColors.length
                          ];
                        const [bg, border] = shade.split(" ");

                        return (
                          <div
                            key={getTextListItemKey(d, index)}
                            className={`p-4 ${bg} rounded-xl border-l-4 ${border} flex items-start gap-3`}
                          >
                            <CheckCircle
                              className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
                            />
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {getTextListItemValue(d)}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-500">
                      <h3 className="font-bold text-[#1F2937] mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        {t(
                          "campaignDetail.fallback.createAuthenticContentTitle",
                        )}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {t(
                          "campaignDetail.fallback.createAuthenticContentDesc",
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-violet-50 rounded-xl border-l-4 border-violet-500">
                      <h3 className="font-bold text-[#1F2937] mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-violet-600" />
                        {t(
                          "campaignDetail.fallback.publishOnPlatformsTitle",
                        )}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {t(
                          "campaignDetail.fallback.publishOnPlatformsDesc",
                          {
                            platforms:
                              campaign.socialPlatform.join(
                                ", ",
                              ),
                          },
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-fuchsia-50 rounded-xl border-l-4 border-fuchsia-500">
                      <h3 className="font-bold text-[#1F2937] mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-fuchsia-600" />
                        {t(
                          "campaignDetail.fallback.reportMetricsTitle",
                        )}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {t(
                          "campaignDetail.fallback.reportMetricsDesc",
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-500">
                      <h3 className="font-bold text-[#1F2937] mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                        {t(
                          "campaignDetail.fallback.maintainCommunicationTitle",
                        )}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {t(
                          "campaignDetail.fallback.maintainCommunicationDesc",
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Requisitos */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                  <CheckCircle className="w-5 h-5 text-[#7C3AED]" />
                  {t("campaignDetail.requirements")}
                </h3>

                <ul className="space-y-3">
                  {requirements_list.length > 0
                    ? requirements_list.map(
                        (req, index) => (
                          <li
                            key={getTextListItemKey(req, index)}
                            className="flex items-start gap-3 group"
                          >
                            <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-700 text-sm leading-relaxed">
                              {getTextListItemValue(req)}
                            </span>
                          </li>
                        ),
                      )
                    : campaign.requirements.map(
                        (req, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 group"
                          >
                            <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-700 text-sm leading-relaxed">
                              {req}
                            </span>
                          </li>
                        ),
                      )}
                </ul>
              </div>

              {/* Imagen */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={t("campaignDetail.visualAlt")}
                    width={1200}
                    height={768}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl mb-4" />
                )}

                <h3 className="font-semibold text-[#1F2937] mb-2">
                  {t(
                    "campaignDetail.professionalCollaboration",
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(
                    "campaignDetail.professionalCollaborationDesc",
                  )}
                </p>
              </div>

              {/* CTA - Postularse */}
              {hasApplied ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600 fill-green-600" />
                    <p className="font-semibold text-green-900">
                      {t("campaignDetail.alreadyApplied")}
                    </p>
                  </div>
                  <p className="text-green-700 text-sm mb-4">
                    {t(
                      "campaignDetail.viewStatusInMyApplications",
                    )}
                  </p>
                  <button
                    onClick={() =>
                      navigate("/creator/applications")
                    }
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    {t("campaignDetail.viewMyApplications")}
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F7EE63]" />
                    {t("campaignDetail.readyToCollaborate")}
                  </h3>
                  <p className="text-white/90 text-sm mb-4">
                    {t("campaignDetail.applyNowDesc")}
                  </p>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full px-4 py-3 bg-white text-[#7C3AED] rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {applying
                      ? t("common.loading")
                      : t("campaignDetail.applyNow")}
                  </button>
                </div>
              )}

              {/* Consejo */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Award className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1">
                      {t("campaignDetail.creatorConnectTip")}
                    </h3>
                    <p className="text-sm text-purple-700">
                      {t(
                        "campaignDetail.creatorConnectTipDesc",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}