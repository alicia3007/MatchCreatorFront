"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import type { Company, Campaign } from "@/app/context/UserContext";
import { useTranslation } from "react-i18next";
import CompanySidebar from "@/app/components/CompanySidebar";
import CreatorSidebar from "@/app/components/CreatorSidebar";
import {
  ArrowLeft, Star, Building2, Award, Mail, Briefcase,
  Target, DollarSign, Users, TrendingUp, CheckCircle2, Loader2,
} from "lucide-react";
import { companiesService } from "../api";
import { campaignsService } from "../api";
import Image from "next/image";

export default function CompanyPublicProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const { userType } = useUser();

  const [company, setCompany] = useState<Company | null>(null);
  const [companyCampaigns, setCompanyCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const resolvedId = Array.isArray(id) ? id[0] : id;
      if (!resolvedId) return;

      try {
        setIsLoading(true);
        const [companyData, campaignsData] = await Promise.all([
          companiesService.getById(resolvedId),
          campaignsService.getByCompany(resolvedId),
        ]);
        setCompany(companyData);
        setCompanyCampaigns(
          campaignsData.filter((c) => c.status === "active"),
        );
      } catch (error) {
        console.error("Error al cargar empresa:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const Sidebar = userType === "creator" ? CreatorSidebar : CompanySidebar;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0EA5E9] animate-spin" />
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <p className="text-center text-gray-600">
            {t("companyPublicProfile.notFound")}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0EA5E9]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t("common.back")}</span>
            </button>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* ── HERO ── */}
          <div className="bg-white rounded-lg overflow-hidden mb-6">
            <div className="h-44 bg-[#0EA5E9] relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative -mt-20 flex-shrink-0">
<Image
  src={company.logo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(company.name) + "&background=0EA5E9&color=fff&size=128"}
  alt={company.name}
  width={128}
  height={128}
  className="w-32 h-32 rounded-xl object-cover border-4 border-white bg-white"
/>
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#0EA5E9] rounded-full flex items-center justify-center border-2 border-white">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-black text-[#1F2937] mb-1">{company.name}</h1>
                  <p className="text-base font-bold text-[#0EA5E9] mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {company.sector}
                  </p>
                  <p className="text-gray-600 text-base leading-relaxed max-w-3xl mb-5">
                    {company.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0EA5E9] text-white rounded p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4" />
                        <p className="text-2xl font-black">{company.rating.toFixed(1)}</p>
                      </div>
                      <p className="text-xs text-white/80">{t("companyPublicProfile.stats.rating")}</p>
                    </div>
                    <div className="bg-[#F7EE63] rounded p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-gray-800" />
                        <p className="text-2xl font-black text-gray-800">{companyCampaigns.length}</p>
                      </div>
                      <p className="text-xs text-gray-700">{t("companyPublicProfile.stats.activeCampaigns")}</p>
                    </div>
                    <div className="bg-green-500 text-white rounded p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4" />
                        <p className="text-2xl font-black">{company.reviews?.length ?? 0}</p>
                      </div>
                      <p className="text-xs text-white/80">{t("companyPublicProfile.stats.collaborations")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Columna principal ── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-[#1F2937]">
                  <Building2 className="w-5 h-5 text-[#0EA5E9]" />
                  {t("companyPublicProfile.sections.about")}
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">{company.description}</p>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-[#1F2937]">
                  <Target className="w-5 h-5 text-[#0EA5E9]" />
                  {t("companyPublicProfile.sections.objectives")}
                </h2>
                {!company.objectives || company.objectives.length === 0 ? (
                  <div className="bg-gray-50 p-4 text-sm text-gray-500 rounded">
                    {t("companyPublicProfile.objectives.empty")}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {company.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded border-l-4 border-[#0EA5E9]">
                        <CheckCircle2 className="w-4 h-4 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 font-medium">{objective}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {companyCampaigns.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-[#1F2937]">
                    <TrendingUp className="w-5 h-5 text-[#0EA5E9]" />
                    {t("companyPublicProfile.sections.activeCampaigns", { count: companyCampaigns.length })}
                  </h2>
                  <div className="space-y-3">
                    {companyCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        onClick={() => router.push(`/creator/campaigns/${campaign.id}`)}
                        className="p-4 border border-gray-200 rounded hover:border-[#0EA5E9] cursor-pointer group"
                      >
                        <h3 className="font-bold text-[#1F2937] mb-1 group-hover:text-[#0EA5E9] text-sm">
                          {campaign.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-sm font-bold text-gray-700">{campaign.budget}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {campaign.creatorType.slice(0, 2).map((type, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded text-xs font-semibold">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {company.reviews && company.reviews.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-[#1F2937]">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    {t("companyPublicProfile.sections.reviews", { count: company.reviews.length })}
                  </h2>
                  <div className="space-y-4">
                    {company.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-[#1F2937] text-sm">{review.from}</p>
                            <p className="text-xs text-gray-400">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5">
              {companyCampaigns.length > 0 && (
                <div className="bg-[#0EA5E9] rounded-lg p-6 text-white text-center">
                  <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <h3 className="text-base font-bold mb-1">
                    {t("companyPublicProfile.cta.title", { count: companyCampaigns.length })}
                  </h3>
                  <p className="text-xs text-white/85 mb-4">{t("companyPublicProfile.cta.subtitle")}</p>
                  <button
                    onClick={() => router.push("/creator/campaigns")}
                    className="w-full px-5 py-2.5 bg-white text-[#0EA5E9] rounded font-bold text-sm"
                  >
                    {t("companyPublicProfile.cta.button")}
                  </button>
                </div>
              )}

              <div className="bg-white rounded-lg p-5">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-[#1F2937]">
                  <DollarSign className="w-4 h-4 text-[#0EA5E9]" />
                  {t("companyPublicProfile.sidebar.budget")}
                </h3>
                <p className="text-xl font-black text-[#0EA5E9]">{company.budget}</p>
                <p className="text-xs text-gray-400 mt-1">{t("companyPublicProfile.sidebar.budgetHint")}</p>
              </div>

              <div className="bg-white rounded-lg p-5">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-[#1F2937]">
                  <Briefcase className="w-4 h-4 text-[#0EA5E9]" />
                  {t("companyPublicProfile.sidebar.industry")}
                </h3>
                <div className="px-3 py-2 bg-[#0EA5E9] text-white rounded text-center font-bold text-sm">
                  {company.sector}
                </div>
              </div>

              <div className="bg-white rounded-lg p-5">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-[#1F2937]">
                  <Mail className="w-4 h-4 text-[#0EA5E9]" />
                  {t("companyPublicProfile.sidebar.contact")}
                </h3>
                <p className="text-sm text-gray-700 break-all">{company.email}</p>
              </div>

              <div className="bg-white rounded-lg p-5">
                <h3 className="text-sm font-bold mb-3 text-[#1F2937]">
                  {t("companyPublicProfile.sidebar.statsTitle")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-gray-700">{t("companyPublicProfile.sidebar.avgRating")}</span>
                    </div>
                    <span className="text-xs font-bold text-[#1F2937]">{company.rating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      <span className="text-xs font-medium text-gray-700">{t("companyPublicProfile.sidebar.collaborations")}</span>
                    </div>
                    <span className="text-xs font-bold text-[#1F2937]">{company.reviews?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-medium text-gray-700">{t("companyPublicProfile.sidebar.activeCampaigns")}</span>
                    </div>
                    <span className="text-xs font-bold text-[#1F2937]">{companyCampaigns.length}</span>
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