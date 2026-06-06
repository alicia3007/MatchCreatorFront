"use client";
import { useUser, Company } from "@/app/context/UserContext";
import CompanySidebar from "@/app/components/CompanySidebar";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Star,
  Sparkles,
  TrendingUp,
  Users,
  Filter,
  X,
  ChevronDown,
  Search,
  Zap,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { creatorsService, recommendationsService } from "../api";
import type { Creator } from "@/app/context/UserContext";

interface FilterState {
  socialPlatforms: string[];
  categories: string[];
  followerRanges: string[];
}

export default function BrowseCreators() {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const router = useRouter();
  const company = currentUser as Company;

  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [showAIResults, setShowAIResults] = useState(false);
  const [aiRecommendedCreators, setAiRecommendedCreators] = useState<Creator[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    socialPlatforms: [],
    categories: [],
    followerRanges: [],
  });

  useEffect(() => {
    const loadCreators = async () => {
      try {
        setIsLoadingCreators(true);
        const data = await creatorsService.getAll();
        setCreators(data);
      } catch (error) {
        console.error("Error al cargar creadores:", error);
      } finally {
        setIsLoadingCreators(false);
      }
    };

    loadCreators();
  }, []);

  const filterOptions = useMemo(
    () => ({
      socialPlatforms: ["Instagram", "TikTok", "YouTube", "Twitch", "Twitter/X", "Facebook"],
      categories: [
        t("browseCreatorsPage.categories.tech"),
        t("browseCreatorsPage.categories.gaming"),
        t("browseCreatorsPage.categories.fashion"),
        t("browseCreatorsPage.categories.lifestyle"),
        t("browseCreatorsPage.categories.fitness"),
        t("browseCreatorsPage.categories.beauty"),
        t("browseCreatorsPage.categories.travel"),
        t("browseCreatorsPage.categories.food"),
        t("browseCreatorsPage.categories.design"),
        t("browseCreatorsPage.categories.wellness"),
        t("browseCreatorsPage.categories.yoga"),
      ],
      followerRanges: [
        t("followerRanges.nano"),
        t("followerRanges.micro"),
        t("followerRanges.midTier"),
        t("followerRanges.macro"),
        t("followerRanges.mega"),
      ],
    }),
    [t],
  );

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

  const calculateSectorMatch = (contentTypes: string[], sector: string): number => {
    const sectorLower = sector.toLowerCase();
    const contentLower = contentTypes.map((c) => c.toLowerCase());

    const sectorMatches: { [key: string]: string[] } = {
      tecnología: ["tech", "gaming", "tecnología", "software", "gadgets"],
      moda: ["moda", "fashion", "lifestyle", "belleza", "beauty"],
      "salud y bienestar": ["fitness", "salud", "wellness", "health", "yoga"],
      alimentos: ["food", "comida", "cocina", "gastronomía"],
      viajes: ["travel", "viajes", "turismo", "aventura"],
      educación: ["educación", "education", "tutoriales"],
    };

    const matchKeywords = sectorMatches[sectorLower] || [sectorLower];

    let matchCount = 0;
    for (const content of contentLower) {
      for (const keyword of matchKeywords) {
        if (content.includes(keyword) || keyword.includes(content)) {
          matchCount++;
          break;
        }
      }
    }

    return Math.min(matchCount / contentTypes.length, 1);
  };

  const calculateReachMatch = (followers: number, budget: string): number => {
    const budgetNum = parseBudget(budget);
    const estimatedCost = (followers / 1000) * 30; // $30 por 1K followers

    const ratio = budgetNum / estimatedCost;

    if (ratio >= 0.7 && ratio <= 1.3) return 1.0;
    if (ratio >= 0.5 && ratio <= 1.5) return 0.7;
    if (ratio >= 0.3 && ratio <= 2.0) return 0.4;
    return 0.1;
  };

  const calculateExperienceMatch = (experience: string): number => {
    const match = experience.match(/(\d+)/);
    const years = match ? parseInt(match[0]) : 0;

    if (years >= 3) return 1.0;
    if (years >= 1) return 0.5;
    return 0.2;
  };

  const calculateCreatorScore = (creator: Creator, company: Company | null): number => {
    if (!company) return 0;

    let score = 0;

    // 1. Match de sector/contenido (40 puntos)
    const sectorMatch = calculateSectorMatch(creator.contentType, company.sector);
    score += sectorMatch * 40;

    // 2. Alcance apropiado (20 puntos)
    const totalFollowers = creator.socialMedia.reduce((sum, sm) => sum + sm.followers, 0);
    const reachMatch = calculateReachMatch(totalFollowers, company.budget);
    score += reachMatch * 20;

    // 3. Rating (15 puntos)
    if (creator.rating > 0) {
      score += (creator.rating / 5) * 15;
    }

    // 4. Disponibilidad (10 puntos)
    if (creator.availability === "Disponible") {
      score += 10;
    }

    // 5. Experiencia (10 puntos)
    const experienceMatch = calculateExperienceMatch(creator.experience);
    score += experienceMatch * 10;

    // 6. Portfolio (5 puntos)
    if (creator.portfolio && creator.portfolio.length > 0) {
      score += 5;
    }

    return Math.round(score);
  };

  const handleAIRecommendation = async () => {
    if (!company?.id) return;

    setIsAIAnalyzing(true);
    setShowAIResults(false);
    setAiLoadingStep(1);

    try {
      // Paso 1: Analizando perfil
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAiLoadingStep(2);

      // Paso 2: Llamada al backend
      const recommendations = await recommendationsService.getCreatorRecommendations(
        company.id,
        { limit: 6 },
      );

      setAiLoadingStep(3);

      const topCreators = recommendations.map((r) => {
        // Mapear CreatorRecommendation al tipo Creator del contexto
        return creators.find((c) => c.id === r.creator.id) ?? {
          ...r.creator,
          reviews: [],
          pricing: [],
        } as unknown as Creator;
      }).filter(Boolean) as Creator[];

      setAiRecommendedCreators(
        topCreators.length > 0 ? topCreators : creators.slice(0, 4),
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
    setFilters({ socialPlatforms: [], categories: [], followerRanges: [] });

  const totalActiveFilters = Object.values(filters).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const getFilterCount = (category: keyof FilterState) => filters[category].length;

  const filteredCreators = creators.filter((creator) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        creator.name.toLowerCase().includes(q) ||
        creator.publicName.toLowerCase().includes(q) ||
        creator.bio.toLowerCase().includes(q) ||
        creator.contentType.some((c) => c.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.socialPlatforms.length > 0) {
      if (
        !creator.socialMedia.some((s) =>
          filters.socialPlatforms.some((p) =>
            s.platform.toLowerCase().includes(p.toLowerCase()),
          ),
        )
      )
        return false;
    }
    if (filters.categories.length > 0) {
      if (
        !creator.contentType.some((type) =>
          filters.categories.some((cat) =>
            type.toLowerCase().includes(cat.toLowerCase()),
          ),
        )
      )
        return false;
    }
    if (filters.followerRanges.length > 0) {
      const total = creator.socialMedia.reduce((sum, s) => sum + s.followers, 0);
      const match = filters.followerRanges.some((range) => {
        if (range === t("followerRanges.nano")) return total >= 1000 && total < 10000;
        if (range === t("followerRanges.micro")) return total >= 10000 && total < 50000;
        if (range === t("followerRanges.midTier")) return total >= 50000 && total < 100000;
        if (range === t("followerRanges.macro")) return total >= 100000 && total < 1000000;
        if (range === t("followerRanges.mega")) return total >= 1000000;
        return false;
      });
      if (!match) return false;
    }
    return true;
  });

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(0)}K`
        : n.toString();

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("instagram"))
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#E1306C">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    if (p.includes("youtube"))
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    if (p.includes("tiktok"))
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#010101">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
        </svg>
      );
    if (p.includes("twitch"))
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#9146FF">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
      );
    if (p.includes("facebook"))
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    if (p.includes("twitter") || p.includes("x"))
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#000000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    return <TrendingUp className="w-3.5 h-3.5 text-gray-500" />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CompanySidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0EA5E9] via-[#06B6D4] to-[#38BDF8] shadow-2xl sticky top-0 z-20">
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative px-8 py-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                  <Zap className="w-7 h-7" />
                  {t("browseCreatorsPage.header.title")}
                </h1>
                <p className="text-white/95 text-base font-medium">
                  {t("browseCreatorsPage.header.subtitle")}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30">
                <p className="text-white/90 text-sm font-semibold mb-1">
                  {t("browseCreatorsPage.header.results")}
                </p>
                <p className="text-3xl font-black text-white">
                  {isLoadingCreators ? "..." : filteredCreators.length}
                </p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EA5E9]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("browseCreatorsPage.searchPlaceholder")}
                className="w-full pl-12 pr-5 py-3 bg-white rounded-xl outline-none text-[#1F2937] placeholder:text-gray-400 shadow-xl text-base font-medium focus:ring-4 focus:ring-white/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 relative">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-bold text-xs">
                  {t("browseCreatorsPage.filtersLabel")}
                </span>
              </div>
              <FilterDropdown
                title={t("browseCreatorsPage.filters.socialNetwork")}
                options={filterOptions.socialPlatforms}
                selected={filters.socialPlatforms}
                onToggle={(v: string) => toggleFilter("socialPlatforms", v)}
                isOpen={openDropdown === "social"}
                onToggleOpen={() => setOpenDropdown(openDropdown === "social" ? null : "social")}
                count={getFilterCount("socialPlatforms")}
              />
              <FilterDropdown
                title={t("browseCreatorsPage.filters.category")}
                options={filterOptions.categories}
                selected={filters.categories}
                onToggle={(v: string) => toggleFilter("categories", v)}
                isOpen={openDropdown === "category"}
                onToggleOpen={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
                count={getFilterCount("categories")}
              />
              <FilterDropdown
                title={t("browseCreatorsPage.filters.reach")}
                options={filterOptions.followerRanges}
                selected={filters.followerRanges}
                onToggle={(v: string) => toggleFilter("followerRanges", v)}
                isOpen={openDropdown === "reach"}
                onToggleOpen={() => setOpenDropdown(openDropdown === "reach" ? null : "reach")}
                count={getFilterCount("followerRanges")}
              />
              {totalActiveFilters > 0 && (
                <>
                  <div className="h-6 w-px bg-white/30" />
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all shadow-lg hover:scale-105"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t("browseCreatorsPage.clearFilters", { count: totalActiveFilters })}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-8">
          {/* AI Button */}
          <div className="mb-8">
            <button
              onClick={handleAIRecommendation}
              disabled={isAIAnalyzing || isLoadingCreators}
              className={`w-full bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#7C3AED] text-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden relative group ${isAIAnalyzing || isLoadingCreators ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative px-8 py-6 flex items-center justify-center gap-3">
                {isAIAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xl font-black">
                      {t("browseCreatorsPage.aiRecommendation.buttonActive")}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span className="text-xl font-black">
                      {t("browseCreatorsPage.aiRecommendation.button")}
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
                    {aiLoadingStep === 1 && t("browseCreatorsPage.aiRecommendation.analyzing")}
                    {aiLoadingStep === 2 && t("browseCreatorsPage.aiRecommendation.matching")}
                    {aiLoadingStep === 3 && t("browseCreatorsPage.aiRecommendation.complete")}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-500 rounded-full"
                      style={{ width: `${(aiLoadingStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-56 bg-gray-300" />
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-3/4" />
                      <div className="h-4 bg-gray-300 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Results */}
          {showAIResults && aiRecommendedCreators.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-[#7C3AED]/5 via-[#A78BFA]/5 to-[#7C3AED]/5 rounded-3xl p-8 border-2 border-[#7C3AED]/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1F2937] mb-1">
                    {t("browseCreatorsPage.aiRecommendation.complete")}
                  </h3>
                  <p className="text-gray-600">
                    {t("browseCreatorsPage.aiRecommendation.description", { sector: company?.sector || "" })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {aiRecommendedCreators.map((creator) => {
                  const total = creator.socialMedia.reduce((s, sm) => s + sm.followers, 0);
                  return (
                    <SimpleCard
                      key={creator.id}
                      creator={creator}
                      total={total}
                      isAI
                      onClick={() => router.push(`/company/creators/${creator.id}`)}
                      fmt={fmt}
                      getPlatformIcon={getPlatformIcon}
                      t={t}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* All creators */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937]">
                {t("browseCreatorsPage.availableTitle")}
              </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-[#0EA5E9] to-transparent rounded-full" />
            </div>

            {isLoadingCreators ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border-2 border-transparent">
                    <div className="h-56 bg-gray-300" />
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-4 border-dashed border-gray-200">
                <div className="w-32 h-32 bg-gradient-to-br from-[#0EA5E9]/20 to-[#38BDF8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-16 h-16 text-[#0EA5E9]" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937] mb-4">
                  {t("browseCreatorsPage.empty.title")}
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  {t("browseCreatorsPage.empty.subtitle")}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-10 py-4 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
                >
                  {t("browseCreatorsPage.empty.clearBtn")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredCreators.map((creator) => {
                  const total = creator.socialMedia.reduce((s, sm) => s + sm.followers, 0);
                  return (
                    <SimpleCard
                      key={creator.id}
                      creator={creator}
                      total={total}
                      isAI={false}
                      onClick={() => router.push(`/company/creators/${creator.id}`)}
                      fmt={fmt}
                      getPlatformIcon={getPlatformIcon}
                      t={t}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SimpleCard({
  creator,
  total,
  isAI,
  onClick,
  fmt,
  getPlatformIcon,
  t,
}: {
  creator: Creator;
  total: number;
  isAI: boolean;
  onClick: () => void;
  fmt: (n: number) => string;
  getPlatformIcon: (platform: string) => React.ReactNode;
  t: (key: string) => string;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer border-2 border-transparent hover:border-[#0EA5E9] transform hover:-translate-y-2"
    >
      <div className="relative h-56 overflow-hidden">
        {creator.avatar ? (
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center">
            <span className="text-4xl font-black text-white">
              {creator.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {isAI && (
          <div className="absolute top-3 left-3">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              {t("browseCreatorsPage.card.aiRecommended")}
            </div>
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-[#1F2937]">{creator.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-5">
        <p className="font-bold text-lg text-[#1F2937] mb-1 line-clamp-1">{creator.name}</p>
        <p className="text-[#0EA5E9] text-sm font-semibold mb-3">{creator.publicName}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed min-h-[40px]">
          {creator.bio}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {creator.contentType.slice(0, 2).map((type, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gradient-to-r from-[#0EA5E9]/10 to-[#38BDF8]/10 text-[#0EA5E9] rounded-lg text-xs font-bold border border-[#0EA5E9]/20"
            >
              {type}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-[#0EA5E9]" />
              <span className="text-lg font-black text-[#1F2937]">{fmt(total)}</span>
            </div>
            <p className="text-xs text-gray-600">{t("browseCreatorsPage.card.followers")}</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-lg font-black text-[#1F2937]">
                {creator.socialMedia?.length || 0}
              </span>
            </div>
            <p className="text-xs text-gray-600">{t("browseCreatorsPage.card.networks")}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {creator.socialMedia?.slice(0, 4).map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
            >
              {getPlatformIcon(s.platform)}
              <span className="text-xs font-bold text-[#1F2937]">{fmt(s.followers)}</span>
            </div>
          ))}
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
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  count: number;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && isOpen)
        onToggleOpen();
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
            ? "bg-white text-[#0EA5E9] ring-2 ring-white scale-105"
            : "bg-white/90 hover:bg-white text-[#1F2937]"
        }`}
      >
        {title}
        {count > 0 && (
          <span className="px-2 py-0.5 bg-[#0EA5E9] text-white text-xs font-black rounded-full">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-3 left-0 w-72 bg-white rounded-2xl shadow-2xl border-2 border-[#0EA5E9]/20 p-4 max-h-96 overflow-y-auto z-30">
          <div className="space-y-1">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer hover:bg-[#0EA5E9]/5 p-3 rounded-xl transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onToggle(option)}
                  className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#0EA5E9] cursor-pointer"
                />
                <span
                  className={`text-sm font-semibold flex-1 ${
                    selected.includes(option) ? "text-[#0EA5E9]" : "text-gray-700"
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