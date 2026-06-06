"use client";

import { useUser } from "../context/UserContext";
import type { Campaign } from "../context/UserContext";
import CreatorSidebar from "../components/CreatorSidebar";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Instagram,
  Youtube,
  Users,
  Filter,
  X,
  ChevronDown,
  Bookmark,
  Search,
  Calendar,
  DollarSign,
  Building2,
  Target,
  Facebook,
  Hash,
  ArrowRight,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { campaignsService, recommendationsService } from "../api";

interface FilterState {
  contentTypes: string[];
  platforms: string[];
  budgetRanges: string[];
}

interface CurrentUserWithSocialMedia {
  id?: string;
  contentType?: string[] | null;
  socialMedia?: { platform: string; followers: number }[];
  availability?: string;
}

type NavigateTo = (href: string) => void;

interface CampaignCardProps {
  campaign: Campaign;
  isSaved: boolean;
  isRecommended: boolean;
  onSave: () => void;
  onClick: () => void;
  getPlatformIcon: (platform: string) => ReactNode;
  campaignImage?: string | null;
  navigate: NavigateTo;
  t: TFunction;
  dateLocale: string;
}

interface FilterDropdownProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  count: number;
}

export default function AvailableCampaigns() {
  const { currentUser } = useUser();
  const router = useRouter();
  const navigate: NavigateTo = (href) => router.push(href);
  const { t, i18n } = useTranslation();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ── Estados IA ──
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [showAIResults, setShowAIResults] = useState(false);
  const [aiRecommendedCampaigns, setAiRecommendedCampaigns] = useState<Campaign[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    contentTypes: [],
    platforms: [],
    budgetRanges: [],
  });

  useEffect(() => {
    const loadCampaigns = async () => {
      setLoading(true);
      try {
        const data = await campaignsService.getAvailable();
        setCampaigns(data);
      } catch (error) {
        console.error("Error al cargar campañas:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadCampaigns();
  }, []);

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");

  const filterOptions = {
    contentTypes: [
      t("availableCampaigns.filters.contentTypes.tech"),
      t("availableCampaigns.filters.contentTypes.gaming"),
      t("availableCampaigns.filters.contentTypes.fashion"),
      t("availableCampaigns.filters.contentTypes.lifestyle"),
      t("availableCampaigns.filters.contentTypes.fitness"),
      t("availableCampaigns.filters.contentTypes.beauty"),
      t("availableCampaigns.filters.contentTypes.travel"),
      t("availableCampaigns.filters.contentTypes.food"),
      t("availableCampaigns.filters.contentTypes.design"),
    ],
    platforms: [
      t("platforms.instagram"),
      t("platforms.youtube"),
      t("platforms.facebook"),
      t("availableCampaigns.filters.platforms.twitterX"),
    ],
    budgetRanges: [
      t("availableCampaigns.filters.budgetRanges.low"),
      t("availableCampaigns.filters.budgetRanges.medium"),
      t("availableCampaigns.filters.budgetRanges.high"),
      t("availableCampaigns.filters.budgetRanges.premium"),
    ],
  };

  const creator = currentUser as CurrentUserWithSocialMedia | null;
  const currentUserContentTypes = creator?.contentType ?? [];

  // ── Scoring helpers ──

  const parseBudget = (budget: string): number => {
    const numbers = budget.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 1000;
    if (numbers.length >= 2) {
      const min = parseInt(numbers[0]);
      const max = parseInt(numbers[1]);
      return (min + max) / 2;
    }
    return parseInt(numbers[0]);
  };

  const calculateContentTypeMatch = (
    campaignTypes: string[],
    creatorTypes: string[],
  ): number => {
    const campaignLower = campaignTypes.map((t) => t.toLowerCase());
    const creatorLower = creatorTypes.map((t) => t.toLowerCase());

    let matchCount = 0;
    for (const campaignType of campaignLower) {
      for (const creatorType of creatorLower) {
        if (campaignType.includes(creatorType) || creatorType.includes(campaignType)) {
          matchCount++;
          break;
        }
      }
    }

    if (campaignTypes.length === 0) return 0.5;
    return Math.min(matchCount / campaignTypes.length, 1);
  };

  const calculatePlatformMatch = (
    campaignPlatforms: string[],
    creatorPlatforms: string[],
  ): number => {
    const campaignLower = campaignPlatforms.map((p) => p.toLowerCase());
    const creatorLower = creatorPlatforms.map((p) => p.toLowerCase());

    let matchCount = 0;
    for (const platform of campaignLower) {
      if (creatorLower.some((cp) => cp.includes(platform) || platform.includes(cp))) {
        matchCount++;
      }
    }

    if (campaignPlatforms.length === 0) return 0.5;
    return matchCount / campaignPlatforms.length;
  };

  const calculateBudgetMatch = (followers: number, budget: string): number => {
    const budgetNum = parseBudget(budget);
    const estimatedCost = (followers / 1000) * 30; // $30 por 1K followers

    const ratio = budgetNum / estimatedCost;

    if (ratio >= 0.7 && ratio <= 1.3) return 1.0;
    if (ratio >= 0.5 && ratio <= 1.5) return 0.7;
    if (ratio >= 0.3 && ratio <= 2.0) return 0.4;
    return 0.1;
  };

  const calculateCampaignScore = (campaign: Campaign): number => {
    if (!creator) return 0;

    let score = 0;

    // 1. Match de tipo de contenido (40 puntos)
    const contentMatch = calculateContentTypeMatch(
      campaign.creatorType,
      currentUserContentTypes as string[],
    );
    score += contentMatch * 40;

    // 2. Plataformas en común (30 puntos)
    const creatorPlatforms = creator.socialMedia?.map((sm) => sm.platform) ?? [];
    const platformMatch = calculatePlatformMatch(campaign.socialPlatform, creatorPlatforms);
    score += platformMatch * 30;

    // 3. Presupuesto apropiado (15 puntos)
    const totalFollowers =
      creator.socialMedia?.reduce((sum, sm) => sum + sm.followers, 0) ?? 0;
    const budgetMatch = calculateBudgetMatch(totalFollowers, campaign.budget);
    score += budgetMatch * 15;

    // 4. Disponibilidad (10 puntos)
    if (creator.availability === "Disponible") {
      score += 10;
    }

    // 5. Estado activo (5 puntos)
    if (campaign.status === "active") {
      score += 5;
    }

    return Math.round(score);
  };

  // ── Lógica IA ──

  const handleAIRecommendation = async () => {
  if (!creator?.id) return;

  setIsAIAnalyzing(true);
  setShowAIResults(false);
  setAiLoadingStep(1);

  try {
    // Paso 1: Analizando perfil
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAiLoadingStep(2);

    // Paso 2: Llamada al backend
    const recommendations = await recommendationsService.getCampaignRecommendations(
      creator.id,
      { limit: 6 },
    );

    setAiLoadingStep(3);

    const topCampaigns = recommendations
      .map((r) => {
        return campaigns.find((c) => c.id === r.campaign.id) ?? {
          ...r.campaign,
          applicants: r.campaign.applicants ?? [],
        } as Campaign;
      })
      .filter(Boolean) as Campaign[];

    setAiRecommendedCampaigns(
      topCampaigns.length > 0 ? topCampaigns : activeCampaigns.slice(0, 4),
    );

    setIsAIAnalyzing(false);
    setShowAIResults(true);
  } catch (error) {
    console.error("Error en recomendaciones:", error);
    setIsAIAnalyzing(false);
  }
};

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const clearFilters = () =>
    setFilters({
      contentTypes: [],
      platforms: [],
      budgetRanges: [],
    });

  const getTotalActiveFilters = () =>
    Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  const getFilterCount = (category: keyof FilterState) => filters[category].length;

  const filteredCampaigns = activeCampaigns.filter((campaign) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        campaign.name.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.companyName.toLowerCase().includes(query) ||
        campaign.creatorType.some((type: string) => type.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    if (filters.platforms.length > 0) {
      const hasPlatform = campaign.socialPlatform.some((platform: string) =>
        filters.platforms.some((p) => platform.toLowerCase().includes(p.toLowerCase())),
      );

      if (!hasPlatform) return false;
    }

    if (filters.contentTypes.length > 0) {
      const hasContentType = campaign.creatorType.some((type: string) =>
        filters.contentTypes.some((ct) => type.toLowerCase().includes(ct.toLowerCase())),
      );

      if (!hasContentType) return false;
    }

    if (filters.budgetRanges.length > 0) {
      const budgetValue = parseInt(campaign.budget.replace(/[^0-9]/g, ""));

      const matchesBudget = filters.budgetRanges.some((range) => {
        if (range === t("availableCampaigns.filters.budgetRanges.low")) {
          return budgetValue < 500;
        }
        if (range === t("availableCampaigns.filters.budgetRanges.medium")) {
          return budgetValue >= 500 && budgetValue < 2000;
        }
        if (range === t("availableCampaigns.filters.budgetRanges.high")) {
          return budgetValue >= 2000 && budgetValue < 5000;
        }
        if (range === t("availableCampaigns.filters.budgetRanges.premium")) {
          return budgetValue >= 5000;
        }
        return false;
      });

      if (!matchesBudget) return false;
    }

    return true;
  });

  const handleSaveCampaign = (campaignId: string) => {
    setSavedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId],
    );
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();

    if (p.includes("instagram")) {
      return <Instagram className="w-4 h-4 text-[#E4405F]" />;
    }
    if (p.includes("youtube")) {
      return <Youtube className="w-4 h-4 text-[#FF0000]" />;
    }
    if (p.includes("facebook")) {
      return <Facebook className="w-4 h-4 text-[#1877F2]" />;
    }
    if (p.includes("twitter") || p.includes("x")) {
      return <Hash className="w-4 h-4 text-[#1DA1F2]" />;
    }
    return <Users className="w-4 h-4 text-gray-700" />;
  };

  const dateLocale = i18n.language?.startsWith("es") ? "es-ES" : "en-US";

  return (
    <div className="flex min-h-screen bg-white">
      <CreatorSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header sticky */}
        <div className="relative bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A78BFA] shadow-2xl sticky top-0 z-20">
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative px-8 py-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-black text-white mb-2 drop-shadow-lg flex items-center gap-3">
                  <Zap className="w-7 h-7" />
                  {t("availableCampaigns.header.title")}
                </h1>
                <p className="text-white/95 text-base font-medium">
                  {t("availableCampaigns.header.subtitle")}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30">
                <p className="text-white/90 text-sm font-semibold mb-1">
                  {t("availableCampaigns.header.results")}
                </p>
                <p className="text-3xl font-black text-white">{filteredCampaigns.length}</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7C3AED]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("availableCampaigns.searchPlaceholder")}
                className="w-full pl-12 pr-5 py-3 bg-white rounded-xl outline-none text-[#1F2937] placeholder:text-gray-400 shadow-xl text-base font-medium focus:ring-4 focus:ring-white/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 relative">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-bold text-xs">
                  {t("availableCampaigns.filters.label")}
                </span>
              </div>

              <FilterDropdown
                title={t("availableCampaigns.filters.platform")}
                options={filterOptions.platforms}
                selected={filters.platforms}
                onToggle={(value) => toggleFilter("platforms", value)}
                isOpen={openDropdown === "platform"}
                onToggleOpen={() =>
                  setOpenDropdown(openDropdown === "platform" ? null : "platform")
                }
                count={getFilterCount("platforms")}
              />

              <FilterDropdown
                title={t("availableCampaigns.filters.contentType")}
                options={filterOptions.contentTypes}
                selected={filters.contentTypes}
                onToggle={(value) => toggleFilter("contentTypes", value)}
                isOpen={openDropdown === "content"}
                onToggleOpen={() =>
                  setOpenDropdown(openDropdown === "content" ? null : "content")
                }
                count={getFilterCount("contentTypes")}
              />

              <FilterDropdown
                title={t("availableCampaigns.filters.payment")}
                options={filterOptions.budgetRanges}
                selected={filters.budgetRanges}
                onToggle={(value) => toggleFilter("budgetRanges", value)}
                isOpen={openDropdown === "budget"}
                onToggleOpen={() =>
                  setOpenDropdown(openDropdown === "budget" ? null : "budget")
                }
                count={getFilterCount("budgetRanges")}
              />

              {getTotalActiveFilters() > 0 && (
                <>
                  <div className="h-6 w-px bg-white/30" />
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all shadow-lg hover:scale-105"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t("availableCampaigns.filters.clear", {
                      count: getTotalActiveFilters(),
                    })}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Botón IA */}
          <div className="mb-8">
            <button
              onClick={handleAIRecommendation}
              disabled={isAIAnalyzing}
              className={`w-full bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#7C3AED] text-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden relative group ${isAIAnalyzing ? "cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative px-8 py-6 flex items-center justify-center gap-3">
                {isAIAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xl font-black">
                      {t("availableCampaigns.aiRecommendation.buttonActive")}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span className="text-xl font-black">
                      {t("availableCampaigns.aiRecommendation.button")}
                    </span>
                    <Sparkles className="w-6 h-6" />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* AI Loading */}
          {isAIAnalyzing && (
            <div className="mb-8 bg-white rounded-3xl shadow-xl p-8 border-2 border-[#7C3AED]/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] animate-ping opacity-20" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-[#1F2937] mb-2">
                    {aiLoadingStep === 1 &&
                      t("availableCampaigns.aiRecommendation.analyzing")}
                    {aiLoadingStep === 2 &&
                      t("availableCampaigns.aiRecommendation.matching")}
                    {aiLoadingStep === 3 &&
                      t("availableCampaigns.aiRecommendation.complete")}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-500 rounded-full"
                      style={{ width: `${(aiLoadingStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse flex h-[200px]"
                  >
                    <div className="w-64 bg-gray-300 flex-shrink-0" />
                    <div className="flex-1 p-6 space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-3/4" />
                      <div className="h-4 bg-gray-300 rounded w-1/2" />
                      <div className="h-4 bg-gray-300 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Results */}
          {showAIResults && aiRecommendedCampaigns.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-[#7C3AED]/5 via-[#A78BFA]/5 to-[#7C3AED]/5 rounded-3xl p-8 border-2 border-[#7C3AED]/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1F2937] mb-1">
                    {t("availableCampaigns.aiRecommendation.complete")}
                  </h3>
                  <p className="text-gray-600">
                    {t("availableCampaigns.aiRecommendation.description")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {aiRecommendedCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isSaved={savedCampaigns.includes(campaign.id)}
                    isRecommended={true}
                    onSave={() => handleSaveCampaign(campaign.id)}
                    onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
                    getPlatformIcon={getPlatformIcon}
                    campaignImage={campaign.mainImage}
                    navigate={navigate}
                    t={t}
                    dateLocale={dateLocale}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lista principal */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-4 border-dashed border-gray-200">
              <div className="w-32 h-32 bg-gradient-to-br from-[#7C3AED]/20 to-[#A78BFA]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-16 h-16 text-[#7C3AED] animate-spin" />
              </div>
              <h3 className="text-3xl font-bold text-[#1F2937] mb-4">
                {t("common.loading")}
              </h3>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-4 border-dashed border-gray-200">
              <div className="w-32 h-32 bg-gradient-to-br from-[#7C3AED]/20 to-[#A78BFA]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-16 h-16 text-[#7C3AED]" />
              </div>
              <h3 className="text-3xl font-bold text-[#1F2937] mb-4">
                {t("availableCampaigns.empty.title")}
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {t("availableCampaigns.empty.subtitle")}
              </p>
              <button
                onClick={clearFilters}
                className="px-10 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                {t("availableCampaigns.empty.clearFilters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  isSaved={savedCampaigns.includes(campaign.id)}
                  isRecommended={false}
                  onSave={() => handleSaveCampaign(campaign.id)}
                  onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
                  getPlatformIcon={getPlatformIcon}
                  campaignImage={campaign.mainImage}
                  navigate={navigate}
                  t={t}
                  dateLocale={dateLocale}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CampaignCard({
  campaign,
  isSaved,
  isRecommended,
  onSave,
  onClick,
  getPlatformIcon,
  campaignImage,
  navigate,
  t,
  dateLocale,
}: CampaignCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer border-2 border-transparent hover:border-[#7C3AED] transform hover:-translate-y-1 flex h-[340px]"
    >
      <div className="relative w-64 h-full flex-shrink-0 overflow-hidden">
        {campaignImage ? (
          <Image
            src={campaignImage}
            alt={campaign.name}
            fill
            sizes="256px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/20 to-transparent" />

        {isRecommended && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xl">
              <Sparkles className="w-3.5 h-3.5" />
              {t("availableCampaigns.card.recommended")}
            </div>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all shadow-lg z-10 ${
            isSaved ? "bg-[#7C3AED] scale-110" : "bg-white/90 hover:bg-white"
          }`}
          aria-label={t("availableCampaigns.card.save")}
        >
          <Bookmark
            className={`w-4 h-4 ${isSaved ? "fill-white text-white" : "text-gray-700"}`}
          />
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-[#1F2937] mb-2">{campaign.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/companies/${campaign.companyId}`);
              }}
              className="flex items-center gap-2 text-[#7C3AED] mb-3 cursor-pointer hover:text-[#A78BFA] transition-colors w-fit group"
            >
              <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold group-hover:underline">
                {campaign.companyName}
              </span>
            </button>
          </div>
        </div>

        <p className="text-[15px] text-gray-600 mb-3 leading-relaxed line-clamp-3">
          {campaign.description}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="text-center bg-gradient-to-br from-[#7C3AED]/5 to-[#A78BFA]/5 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <DollarSign className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="text-sm font-black text-[#1F2937]">{campaign.budget}</span>
            </div>
            <p className="text-xs text-gray-600 font-semibold">
              {t("availableCampaigns.card.payment")}
            </p>
          </div>
          <div className="text-center bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users className="w-3.5 h-3.5 text-green-500" />
              <span className="text-sm font-black text-[#1F2937]">
                {campaign.applicants.length}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-semibold">
              {t("campaigns.applicants")}
            </p>
          </div>
          <div className="text-center bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-black text-[#1F2937] leading-tight">
                {new Date(campaign.startDate).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "short",
                })}
                {" - "}
                {new Date(campaign.endDate).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-semibold">
              {t("availableCampaigns.card.duration")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {campaign.creatorType.map((type: string, index: number) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gradient-to-r from-[#7C3AED]/10 to-[#A78BFA]/10 text-[#7C3AED] rounded-md text-xs font-bold border border-[#7C3AED]/20"
            >
              {type}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-1.5">
            {campaign.socialPlatform.map((platform: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-md border border-gray-200"
              >
                {getPlatformIcon(platform)}
                <span className="text-xs font-semibold text-gray-700">{platform}</span>
              </div>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex-shrink-0"
          >
            {t("availableCampaigns.card.viewDetails")}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({
  title,
  options,
  selected,
  onToggle,
  isOpen,
  onToggleOpen,
  count,
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onToggleOpen();
      }
    };

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onToggleOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggleOpen}
        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:scale-105 ${
          count > 0
            ? "bg-white text-[#7C3AED] ring-2 ring-white scale-105"
            : "bg-white/90 hover:bg-white text-[#1F2937]"
        }`}
      >
        {title}
        {count > 0 && (
          <span className="px-2 py-0.5 bg-[#7C3AED] text-white text-xs font-black rounded-full">
            {count}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-3 left-0 w-72 bg-white rounded-2xl shadow-2xl border-2 border-[#7C3AED]/20 p-4 max-h-96 overflow-y-auto z-30">
          <div className="space-y-1">
            {options.map((option: string) => (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer hover:bg-[#7C3AED]/5 p-3 rounded-xl transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onToggle(option)}
                  className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#7C3AED] cursor-pointer"
                />
                <span
                  className={`text-sm font-semibold flex-1 ${
                    selected.includes(option) ? "text-[#7C3AED]" : "text-gray-700"
                  }`}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}