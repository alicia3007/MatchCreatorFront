"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useUser,
  Company,
  Creator,
} from "../context/UserContext";
import CompanySidebar from "../components/CompanySidebar";
import {
  ArrowLeft,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
  ExternalLink,
  MapPin,
  Cake,
  GraduationCap,
  User2,
  DollarSign,
  Mail,
  Loader2,
  Users,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { creatorsService, messagesService } from "../api";

export default function CreatorPublicProfile() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const { currentUser, addMessage, addConversation } = useUser();

  const company = currentUser as Company | null;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);

  const loadCreator = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await creatorsService.getPublicProfile(id);
      setCreator(data);
    } catch (error) {
      console.error("Error al cargar creador:", error);
      setCreator(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCreator();
    } else {
      setLoading(false);
    }
  }, [id, loadCreator]);

  const handleStartCollaboration = async () => {
    if (!currentUser || !company || !creator) {
      router.push("/login");
      return;
    }

    setStartingConversation(true);

    try {
      const conversation = await messagesService.getOrCreateConversation({
        currentUserId: currentUser.id,
        currentUserType: "company",
        otherUserId: creator.id,
        otherUserType: "creator",
      });

      const synchronizedConversation = {
        ...conversation,
        participants: [
          {
            id: currentUser.id,
            name: company.name,
            avatar: company.logo || "",
            type: "company" as const,
          },
          {
            id: creator.id,
            name: creator.name,
            avatar: creator.avatar || "",
            type: "creator" as const,
          },
        ],
      };

      addConversation(synchronizedConversation);

      const message = await messagesService.sendMessage({
        conversationId: conversation.id,
        senderId: currentUser.id,
        senderName: company.name,
        senderAvatar: company.logo || "",
        text: t("creatorPublicProfile.collaborationMessage", {
          creatorName: creator.publicName || creator.name,
          companyName: company.name,
        }),
      });

      addMessage(message);

      router.push(`/company/messages?conversationId=${conversation.id}`);
    } catch (error) {
      console.error("Error al iniciar colaboración:", error);
    } finally {
      setStartingConversation(false);
    }
  };

  const isRecommended = () => {
    if (!company?.sector || !creator) return false;
    const sector = company.sector.toLowerCase();
    const contentTypes = creator.contentType?.map((type) => type.toLowerCase()) || [];
    const sectorMatches: Record<string, string[]> = {
      tecnología: ["tech", "gaming", "tecnología"],
      moda: ["moda", "lifestyle", "belleza", "fashion"],
      "salud y bienestar": ["fitness", "salud", "wellness", "lifestyle"],
    };
    return contentTypes.some((type) =>
      (sectorMatches[sector] || []).some((match) => type.includes(match)),
    );
  };

  const recommended = isRecommended();

  const totalFollowers = (creator?.socialMedia || []).reduce(
    (sum, social) => sum + social.followers,
    0,
  );

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(0)}K`
        : n.toString();

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("instagram")) return <Instagram className="w-5 h-5" />;
    if (p.includes("youtube")) return <Youtube className="w-5 h-5" />;
    if (p.includes("tiktok")) return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>;
    if (p.includes("twitter") || p.includes("x")) return <Twitter className="w-5 h-5" />;
    if (p.includes("facebook")) return <Facebook className="w-5 h-5" />;
    if (p.includes("twitch")) return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" /></svg>;
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
    return { bg: "bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8]", text: "text-white" };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanySidebar />
        <main className="flex-1 p-8">
          <div className="bg-white rounded-2xl shadow-lg border-0 p-12 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-center text-gray-600">{t("common.loading")}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanySidebar />
        <main className="flex-1 p-8">
          <p className="text-center text-gray-600">{t("creatorPublicProfile.notFound")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CompanySidebar />

      <main className="flex-1 overflow-y-auto">
        {/* ── HEADER ── */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/company/creators")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0EA5E9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t("creatorPublicProfile.backToCreators")}</span>
          </button>

          <button
            onClick={handleStartCollaboration}
            disabled={startingConversation}
            className="px-8 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-xl font-bold text-base shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {startingConversation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {t("creatorPublicProfile.cta.button")}
          </button>
        </div>

        <div className="p-8 max-w-7xl mx-auto">

          {/* ── AI RECOMMENDED BANNER ── */}
          {recommended && (
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("creatorPublicProfile.aiRecommended.title")}</h3>
                  <p className="text-white/95">{t("creatorPublicProfile.aiRecommended.description", { sector: company?.sector })}</p>
                  <ul className="mt-3 space-y-1 text-white/90">
                    <li>{t("creatorPublicProfile.aiRecommended.check1")}</li>
                    <li>{t("creatorPublicProfile.aiRecommended.check2")}</li>
                    <li>{t("creatorPublicProfile.aiRecommended.check3")}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE CARD ── */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="h-56 relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#7C3AED]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative -mt-24 flex-shrink-0">
                  {creator.avatar ? (
                    <Image
                      src={creator.avatar}
                      alt={creator.name}
                      width={176}
                      height={176}
                      className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-white"
                    />
                  ) : (
                    <div className="w-44 h-44 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] border-4 border-white shadow-2xl ring-4 ring-white flex items-center justify-center">
                      <span className="text-4xl font-black text-white">{creator.name?.charAt(0).toUpperCase() ?? "?"}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-full flex items-center justify-center border-4 border-white shadow-2xl group">
                    <Award className="w-7 h-7 text-white" />
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {t("creatorPublicProfile.verifiedProfile")}
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-black text-[#1F2937] mb-2">{creator.name}</h1>
                  <p className="text-2xl font-bold bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] bg-clip-text text-transparent mb-3">{creator.publicName}</p>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mb-6">{creator.bio}</p>
                  {creator.contentType && creator.contentType.length > 0 && (
                    <>
                      <p className="text-sm text-gray-500 font-medium mb-2">{t("creatorPublicProfile.sections.categories")}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {creator.contentType.map((type, i) => (
                          <span key={i} className="px-4 py-2 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform">{type}</span>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { gradient: "from-purple-500 to-pink-500", icon: <Users className="w-6 h-6" />, value: fmt(totalFollowers), label: t("creatorPublicProfile.stats.totalReach") },
                      { gradient: "from-[#F7EE63] to-[#FCD34D]", icon: <Star className="w-6 h-6 fill-white" />, value: creator.rating > 0 ? creator.rating.toFixed(1) : t("creatorPublicProfile.stats.noRating"), label: t("creatorPublicProfile.stats.avgRating") },
                      { gradient: "from-[#0EA5E9] to-[#38BDF8]", icon: <Award className="w-6 h-6" />, value: creator.reviews?.length || 0, label: t("creatorPublicProfile.stats.collaborations") },
                    ].map((stat, i) => (
                      <div key={i} className={`bg-gradient-to-br ${stat.gradient} text-white rounded-2xl p-5 shadow-xl hover:scale-105 transition-transform`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">{stat.icon}</div>
                          <p className="text-3xl font-black">{stat.value}</p>
                        </div>
                        <p className="text-sm font-semibold text-white/90">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">

              {/* ── SOCIAL AUDIENCE ── */}
              <div className="bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  {t("creatorPublicProfile.sections.socialAudience")}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {creator.socialMedia?.map((social, i) => {
                    const colors = getPlatformColors(social.platform);
                    return (
                      <div key={i} className="group p-5 bg-white rounded-xl border-2 border-white/50 hover:border-white transition-all hover:shadow-xl hover:scale-105">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} shadow-lg`}>
                            {getPlatformIcon(social.platform)}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#1F2937] text-lg">{social.platform}</p>
                            <p className="text-sm text-gray-500 truncate">{social.url}</p>
                          </div>
                        </div>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-[#0EA5E9]">{fmt(social.followers)}</p>
                          <p className="text-sm font-semibold text-gray-600 mb-2">{t("creatorPublicProfile.followers")}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── PRICING ── */}
              {creator.pricing && creator.pricing.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#1F2937]">
                    <DollarSign className="w-5 h-5 text-[#0EA5E9]" />
                    {t("creatorPublicProfile.sections.pricing")}
                  </h2>
                  <p className="text-base font-semibold text-gray-700 mb-6">{t("creatorPublicProfile.pricingCurrencyNote")}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-[#1F2937]">Servicio</th>
                          {creator.pricing.map((price, i) => {
                            const colors = getPlatformColors(price.platform);
                            return (
                              <th key={i} className="text-center py-3 px-4 font-semibold text-[#1F2937]">
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
                          <td className="py-4 px-4 font-medium text-gray-700">{t("creatorPublicProfile.pricing.perPost")}</td>
                          {creator.pricing.map((price, i) => (
                            <td key={i} className="py-4 px-4 text-center">
                              {price.perPost > 0 ? (
                                <span className="text-lg font-bold text-[#0EA5E9]">${price.perPost} USD</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-4 font-medium text-gray-700">{t("creatorPublicProfile.pricing.perStory")}</td>
                          {creator.pricing.map((price, i) => (
                            <td key={i} className="py-4 px-4 text-center">
                              {price.perStory > 0 ? (
                                <span className="text-lg font-bold text-[#0EA5E9]">${price.perStory} USD</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-700">{t("creatorPublicProfile.pricing.perLive")}</td>
                          {creator.pricing.map((price, i) => (
                            <td key={i} className="py-4 px-4 text-center">
                              {price.perLive > 0 ? (
                                <span className="text-lg font-bold text-[#0EA5E9]">${price.perLive} USD</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
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
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-[#1F2937]">{t("creatorPublicProfile.sections.portfolio")}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {creator.portfolio.map((img, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-xl">
                        <Image
                          src={img}
                          alt={`Portfolio ${i + 1}`}
                          width={400}
                          height={224}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── REVIEWS ── */}
              <div className="bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-[#F7EE63] fill-[#F7EE63]" />
                  </div>
                  {t("creatorPublicProfile.sections.reviews", { count: creator.reviews?.length || 0 })}
                </h2>
                {!creator.reviews || creator.reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
                    <Star className="w-16 h-16 text-white/50 mx-auto mb-4" />
                    <p className="text-white/90 text-lg">{t("creatorPublicProfile.noReviews")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creator.reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-bold text-[#1F2937] text-lg">{review.from}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-5 h-5 ${star <= review.rating ? "text-[#F7EE63] fill-[#F7EE63]" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
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

            {/* ── SIDEBAR ── */}
            <div className="space-y-6">
              {/* CTA card */}
              <div className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-white mb-1">{t("creatorPublicProfile.cta.title")}</h3>
                <p className="text-sm text-white/80 mb-4">{t("creatorPublicProfile.cta.subtitle")}</p>
                <button
                  onClick={handleStartCollaboration}
                  disabled={startingConversation}
                  className="w-full py-3 bg-white text-[#7C3AED] text-sm font-black rounded-xl hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {startingConversation ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t("creatorPublicProfile.cta.button")}
                </button>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#1F2937]">
                  <Award className="w-5 h-5 text-[#0EA5E9]" />
                  {t("creatorPublicProfile.sections.experience")}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {creator.experience || t("creatorPublicProfile.experienceNotSpecified")}
                </p>
              </div>

              {/* Personal info */}
              {(creator.age || creator.birthDate || creator.city || creator.education) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#1F2937]">
                    <User2 className="w-5 h-5 text-[#0EA5E9]" />
                    {t("creatorPublicProfile.sections.personalInfo")}
                  </h3>
                  <div className="space-y-3">
                    {creator.age && (
                      <div className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Cake className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">{t("creatorPublicProfile.personalInfo.age")}</p>
                          <p className="text-sm font-bold text-[#1F2937]">{t("creatorPublicProfile.personalInfo.ageValue", { age: creator.age })}</p>
                        </div>
                      </div>
                    )}
                    {creator.birthDate && (
                      <div className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">{t("creatorPublicProfile.personalInfo.birthDate")}</p>
                          <p className="text-sm font-bold text-[#1F2937]">{creator.birthDate}</p>
                        </div>
                      </div>
                    )}
                    {creator.city && (
                      <div className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">{t("creatorPublicProfile.personalInfo.location")}</p>
                          <p className="text-sm font-bold text-[#1F2937]">{creator.city}</p>
                        </div>
                      </div>
                    )}
                    {creator.education && (
                      <div className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <GraduationCap className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">{t("creatorPublicProfile.personalInfo.education")}</p>
                          <p className="text-sm font-bold text-[#1F2937]">{creator.education}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}