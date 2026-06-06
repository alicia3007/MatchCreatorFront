"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import type { Company, Campaign } from "../context/UserContext";
import CompanySidebar from "../components/CompanySidebar";
import {
  ArrowLeft,
  Star,
  Sparkles,
  Building2,
  DollarSign,
  Target,
  Users,
  Mail,
  Briefcase,
  BadgeCheck,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useState, useEffect } from "react";
import { campaignsService } from "../api";

export default function CompanyProfile() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { t } = useTranslation();
  const company = currentUser as Company;

  const [companyCampaigns, setCompanyCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!company?.id) return;

    const loadCampaigns = async () => {
      try {
        const data = await campaignsService.getByCompany(company.id);
        const active = data.filter((c) => c.status === "active");
        setCompanyCampaigns(active);
      } catch (error) {
        console.error("Error al cargar campañas:", error);
      }
    };

    void loadCampaigns();
  }, [company?.id]);

  if (!company) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanySidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <p className="text-center text-gray-600">
            {t("companyProfile.notFound")}
          </p>
        </main>
      </div>
    );
  }

  const stats = [
    {
      title: t("companyProfile.stats.rating"),
      value: company.rating > 0 ? company.rating.toFixed(1) : t("companyProfile.notAvailable"),
      icon: Star,
      card: "bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8]",
      iconBg: "bg-white/20",
      iconClass: "fill-white",
    },
    {
      title: t("companyProfile.stats.activeCampaigns"),
      value: `${companyCampaigns.length}`,
      icon: Briefcase,
      card: "bg-gradient-to-br from-[#F7EE63] to-[#FCD34D]",
      iconBg: "bg-white/20",
      iconClass: "",
    },
    {
      title: t("companyProfile.stats.collaborations"),
      value: `${company.reviews?.length || 0}`,
      icon: Users,
      card: "bg-gradient-to-br from-green-500 to-emerald-400",
      iconBg: "bg-white/20",
      iconClass: "",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <CompanySidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-gray-500 hover:text-[#0EA5E9] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </button>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            {/* Cover */}
            <div className="h-44 relative overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0ZWFtJTIwb2ZmaWNlfGVufDF8fHx8MTc4NDYyOTYwMHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt={t("companyProfile.coverAlt")}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0EA5E9]/30 via-[#0EA5E9]/10 to-[#0B1324]/60" />
              <button
                onClick={() => router.push("/register/company")}
                className="absolute top-3 right-3 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg bg-white/95 text-[#0EA5E9] hover:bg-white border border-white/60 text-sm font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t("companyProfile.editProfile")}
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="relative -mt-16 flex-shrink-0">
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl ring-2 ring-gray-100 bg-white"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gray-100 border-4 border-white shadow-xl ring-2 ring-gray-100" />
                  )}
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-2">
                  <h1 className="text-2xl font-black text-[#0F172A] mb-1 tracking-tight">{company.name}</h1>
                  <p className="text-sm font-semibold text-[#0EA5E9] mb-2 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />{company.sector}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mb-4">{company.description}</p>

                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.title} className={`${stat.card} text-white rounded-xl p-3.5 shadow-md`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-7 h-7 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${stat.iconClass}`} />
                            </div>
                            <p className="text-2xl font-black leading-none">{stat.value}</p>
                          </div>
                          <p className="text-xs font-semibold text-white/85">{stat.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layout 2 columnas */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-4">

              {/* About */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
                  <div className="w-6 h-6 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#0F172A]">{t("companyProfile.aboutCompany")}</h2>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm leading-relaxed">{company.description}</p>
                </div>
              </div>

              {/* Objetivos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
                  <div className="w-6 h-6 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#0F172A]">{t("companyProfile.collaborationObjectives")}</h2>
                </div>
                <div className="p-5">
                  {!company.objectives || company.objectives.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">{t("companyProfile.noObjectives")}</p>
                  ) : (
                    <div className="space-y-2">
                      {company.objectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-2.5 p-2.5 bg-[#F0F9FF] rounded-lg border-l-[3px] border-[#0EA5E9]">
                          <CheckCircle2 className="w-4 h-4 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{objective}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campañas activas */}
              {companyCampaigns.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
                    <div className="w-6 h-6 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#0F172A]">
                      {t("companyProfile.availableCampaigns")}
                      <span className="ml-1.5 text-xs font-semibold text-gray-400">({companyCampaigns.length})</span>
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {companyCampaigns.map((campaign: Campaign) => (
                      <div
                        key={campaign.id}
                        onClick={() => router.push(`/company/campaigns/${campaign.id}`)}
                        className="px-5 py-3.5 cursor-pointer hover:bg-[#F8FAFC] transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="font-bold text-[#0F172A] text-sm group-hover:text-[#0EA5E9] transition-colors">{campaign.name}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0 bg-green-50 px-2 py-0.5 rounded-full">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-bold text-green-700">{campaign.budget}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{campaign.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {campaign.creatorType?.slice(0, 2).map((type, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#EFF6FF] text-[#0EA5E9] rounded-full text-[10px] font-semibold border border-[#0EA5E9]/20">{type}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reseñas */}
              {company.reviews && company.reviews.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
                    <div className="w-6 h-6 rounded-lg bg-yellow-50 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <h2 className="text-sm font-bold text-[#0F172A]">
                      {t("companyProfile.creatorReviews")}
                      <span className="ml-1.5 text-xs font-semibold text-gray-400">({company.reviews.length})</span>
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {company.reviews.map((review) => (
                      <div key={review.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <p className="font-bold text-[#0F172A] text-sm">{review.from}</p>
                            <p className="text-[10px] text-gray-400">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Budget */}
              <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-xl shadow-md p-5">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">{t("companyProfile.budget")}</p>
                <p className="text-3xl font-black text-white leading-none">{company.budget}</p>
                <p className="text-xs text-white/55 mt-1.5">{t("companyProfile.monthlyInvestment")}</p>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">{t("companyProfile.statistics")}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { icon: Star, iconClass: "text-yellow-400 fill-yellow-400", label: t("companyProfile.averageRating"), value: company.rating > 0 ? `${company.rating.toFixed(1)}/5.0` : t("companyProfile.notAvailable") },
                    { icon: Users, iconClass: "text-[#0EA5E9]", label: t("companyProfile.collaborations"), value: company.reviews?.length || 0 },
                    { icon: TrendingUp, iconClass: "text-emerald-500", label: t("companyProfile.activeCampaigns"), value: companyCampaigns.length },
                    { icon: BadgeCheck, iconClass: "text-[#0EA5E9]", label: t("companyProfile.status"), value: t("companyProfile.verified") },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${item.iconClass}`} />
                          <span className="text-xs text-gray-500">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-[#0F172A]">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Industry */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">{t("companyProfile.industry")}</h3>
                </div>
                <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-[#0EA5E9]/10 to-[#38BDF8]/10 text-[#0EA5E9] rounded-lg text-sm font-bold border border-[#0EA5E9]/20">{company.sector}</span>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">{t("companyProfile.contact")}</h3>
                </div>
                <p className="text-sm text-gray-600 break-all">{company.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}