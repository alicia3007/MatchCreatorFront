"use client";

import { useUser, Creator, Review } from "../context/UserContext";
import CreatorSidebar from "../components/CreatorSidebar";
import {
  Instagram,
  Youtube,
  Star,
  Award,
  Calendar,
  Twitter,
  Facebook,
  TrendingUp,
  Users,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";

type PricingEntry = {
  platform: string;
  perPost: number;
  perStory: number;
  perLive: number;
};

type SocialEntry = {
  platform: string;
  followers: number;
  url: string;
};

export default function CreatorProfile() {
  const { currentUser } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const creator = currentUser as Creator;

  if (!creator || !creator.socialMedia) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("creatorProfile.loadingProfile")}</p>
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("instagram")) return <Instagram className="w-5 h-5" />;
    if (p.includes("youtube")) return <Youtube className="w-5 h-5" />;
    if (p.includes("tiktok")) return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    );
    if (p.includes("twitter") || p.includes("x.com")) return <Twitter className="w-5 h-5" />;
    if (p.includes("facebook")) return <Facebook className="w-5 h-5" />;
    if (p.includes("twitch")) return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    );
    return <TrendingUp className="w-5 h-5" />;
  };

  const getPlatformColors = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("instagram")) return { bg: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]", text: "text-white" };
    if (p.includes("youtube")) return { bg: "bg-[#FF0000]", text: "text-white" };
    if (p.includes("tiktok")) return { bg: "bg-black", text: "text-white" };
    if (p.includes("twitter") || p.includes("x.com")) return { bg: "bg-black", text: "text-white" };
    if (p.includes("facebook")) return { bg: "bg-[#1877F2]", text: "text-white" };
    if (p.includes("twitch")) return { bg: "bg-[#9146FF]", text: "text-white" };
    return { bg: "bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]", text: "text-white" };
  };

  const totalFollowers = creator.socialMedia.reduce<number>(
    (sum: number, s: SocialEntry) => sum + s.followers,
    0,
  );

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(0)}K`
        : n.toString();

  console.log("🔍 creator.avatar:", JSON.stringify(creator.avatar));
  console.log("🔍 avatar truthy?", !!creator.avatar);
  console.log("🔍 creator completo:", creator);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CreatorSidebar />

      <div className="flex-1 p-4 space-y-4">

        {/* ── HERO ── */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-40 relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1734004691776-d7f04732c174?w=1080"
              alt={t("creatorProfile.coverAlt")}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative -mt-20 flex-shrink-0">
                <div className="relative w-32 h-32">
                  {creator.avatar ? (
                    <Image
                      src={creator.avatar}
                      alt={creator.name}
                      fill
                      className="rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full border-4 border-white bg-purple-200 flex items-center justify-center shadow-2xl ring-4 ring-white">
                      <span className="text-2xl font-bold text-[#7C3AED]">
                        {creator.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-full flex items-center justify-center border-4 border-white shadow-2xl group">
                  <Award className="w-5 h-5 text-white" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t("creatorProfile.verifiedProfile", { defaultValue: "Perfil verificado" })}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-[#1F2937] mb-1">{creator.name}</h1>
                    <p className="text-xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent mb-2">
                      {creator.publicName}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/register/creator")}
                    className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-xl font-bold text-sm shadow-2xl hover:scale-105 transition-all"
                  >
                    {t("creatorProfile.editProfile")}
                  </button>
                </div>
                <p className="text-gray-600 text-base leading-relaxed max-w-3xl mb-4">{creator.bio}</p>

                {creator.contentType && creator.contentType.length > 0 && (
                  <>
                    <p className="text-sm text-gray-500 font-medium mb-2">{t("creatorProfile.categories", { defaultValue: "Categorías" })}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {creator.contentType.map((type: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform">
                          {type}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { gradient: "from-purple-500 to-pink-500", icon: <Users className="w-5 h-5" />, value: fmt(totalFollowers), label: t("creatorProfile.totalReach") },
                    { gradient: "from-[#F7EE63] to-[#FCD34D]", icon: <Star className="w-5 h-5 fill-white" />, value: creator.rating > 0 ? creator.rating.toFixed(1) : t("creatorProfile.notAvailable"), label: t("creatorProfile.averageRating") },
                    { gradient: "from-[#7C3AED] to-[#A78BFA]", icon: <Award className="w-5 h-5" />, value: creator.reviews?.length || 0, label: t("creatorProfile.collaborations") },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.gradient} text-white rounded-xl p-4 shadow-xl hover:scale-105 transition-transform`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">{stat.icon}</div>
                        <p className="text-2xl font-black">{stat.value}</p>
                      </div>
                      <p className="text-sm font-semibold text-white/90">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── REDES + EXPERIENCIA ── */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* Redes — 2/3 */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              {t("creatorProfile.socialMedia")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {creator.socialMedia?.map((social: SocialEntry, i: number) => {
                const colors = getPlatformColors(social.platform);
                return (
                  <div key={i} className="group p-4 bg-white rounded-xl border-2 border-white/50 hover:border-white transition-all hover:shadow-xl hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} shadow-lg`}>
                        {getPlatformIcon(social.platform)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#1F2937] text-base">{social.platform}</p>
                        <p className="text-sm text-gray-500 truncate">{social.url}</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-black text-[#7C3AED]">{fmt(social.followers)}</p>
                      <p className="text-sm font-semibold text-gray-600 mb-1">{t("creatorProfile.followers")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experiencia — 1/3 */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2 text-[#1F2937]">
              <Award className="w-4 h-4 text-[#7C3AED]" />
              {t("creatorProfile.experience")}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {creator.experience || t("creatorProfile.notSpecified")}
            </p>
          </div>
        </div>

        {/* ── TARIFAS ── */}
        {creator.pricing && creator.pricing.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-[#1F2937]">
              <DollarSign className="w-5 h-5 text-[#7C3AED]" />
              {t("creatorProfile.pricingByPlatform")}
            </h2>
            <p className="text-sm text-gray-500 mb-5">{t("creatorProfile.pricingDisclaimer")}</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-[#1F2937] text-base w-1/4">Servicio</th>
                    {creator.pricing.map((price: PricingEntry, i: number) => {
                      const colors = getPlatformColors(price.platform);
                      return (
                        <th key={i} className="text-center py-4 px-4 font-semibold text-[#1F2937]">
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} shadow-sm`}>
                              {getPlatformIcon(price.platform)}
                            </div>
                            <span className="text-sm">{price.platform}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-5 px-4 font-medium text-gray-700 text-base">{t("creatorProfile.perPost")}</td>
                    {creator.pricing.map((price: PricingEntry, i: number) => (
                      <td key={i} className="py-5 px-4 text-center">
                        {price.perPost > 0
                          ? <span className="text-lg font-bold text-[#7C3AED]">${price.perPost} USD</span>
                          : <span className="text-gray-400">-</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-5 px-4 font-medium text-gray-700 text-base">{t("creatorProfile.perStory")}</td>
                    {creator.pricing.map((price: PricingEntry, i: number) => (
                      <td key={i} className="py-5 px-4 text-center">
                        {price.perStory > 0
                          ? <span className="text-lg font-bold text-[#7C3AED]">${price.perStory} USD</span>
                          : <span className="text-gray-400">-</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-5 px-4 font-medium text-gray-700 text-base">{t("creatorProfile.perLive")}</td>
                    {creator.pricing.map((price: PricingEntry, i: number) => (
                      <td key={i} className="py-5 px-4 text-center">
                        {price.perLive > 0
                          ? <span className="text-lg font-bold text-[#7C3AED]">${price.perLive} USD</span>
                          : <span className="text-gray-400">-</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {creator.portfolio && creator.portfolio.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-3 text-[#1F2937]">{t("creatorProfile.portfolio")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {creator.portfolio.map((img: string, i: number) => (
                <div key={i} className="relative group overflow-hidden rounded-xl">
                  <Image
                    src={img}
                    alt={t("creatorProfile.portfolioItemAlt", { number: i + 1 })}
                    width={400}
                    height={176}
                    className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESEÑAS ── */}
        <div className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-[#F7EE63] fill-[#F7EE63]" />
            </div>
            {t("creatorProfile.reviews")} ({creator.reviews?.length ?? 0})
          </h2>
          {!creator.reviews || creator.reviews.length === 0 ? (
            <div className="text-center py-8 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
              <Star className="w-10 h-10 text-white/50 mx-auto mb-3" />
              <p className="text-white/90 text-base">{t("creatorProfile.noReviewsYet")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creator.reviews.map((review: Review) => (
                <div key={review.id} className="p-4 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-[#1F2937] text-base">{review.from}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "text-[#F7EE63] fill-[#F7EE63]" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">{review.comment}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <p>{review.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}