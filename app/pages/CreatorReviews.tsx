"use client";
import { useEffect, useState, useCallback } from "react";
import {
  useUser,
  Creator,
  Company,
  Review,
} from "../context/UserContext";
import CreatorSidebar from "../components/CreatorSidebar";
import {
  Star,
  MessageSquare,
  Building2,
  CheckCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import {
  applicationsService,
  campaignsService,
  companiesService,
  creatorsService,
} from "../api";

export default function CreatorReviews() {
  const { t } = useTranslation();
  const { currentUser, isLoadingUser } = useUser();

  const creator = currentUser as Creator | null;

  const [activeTab, setActiveTab] = useState<"received" | "write">("received");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [collaboratedCompanies, setCollaboratedCompanies] = useState<Company[]>([]);
  const [companyReviewsById, setCompanyReviewsById] = useState<Record<string, Review[]>>({});

  const loadReviewsPageData = useCallback(async () => {
    if (!creator?.id) return;

    setLoading(true);

    try {
      const [creatorReviews, applications] = await Promise.all([
        creatorsService.getReviews(creator.id),
        applicationsService.getMine(),
      ]);

      setReviews(creatorReviews);

      const confirmedApplications = applications.filter(
        (application) => application.status === "confirmed",
      );

      const uniqueCampaignIds = Array.from(
        new Set(confirmedApplications.map((application) => application.campaignId)),
      );

      const campaignResults = await Promise.allSettled(
        uniqueCampaignIds.map((campaignId) => campaignsService.getById(campaignId)),
      );

      const campaigns = campaignResults
        .filter(
          (result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof campaignsService.getById>>> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      const uniqueCompanyIds = Array.from(
        new Set(campaigns.map((campaign) => campaign.companyId)),
      );

      const companyResults = await Promise.allSettled(
        uniqueCompanyIds.map((companyId) => companiesService.getById(companyId)),
      );

      const companies = companyResults
        .filter(
          (result): result is PromiseFulfilledResult<Company> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      setCollaboratedCompanies(companies);

      const companyReviewResults = await Promise.allSettled(
        companies.map(async (company) => {
          const companyReviews = await companiesService.getReviews(company.id);
          return { companyId: company.id, reviews: companyReviews };
        }),
      );

      const nextCompanyReviewsById: Record<string, Review[]> = {};

      companyReviewResults.forEach((result) => {
        if (result.status === "fulfilled") {
          nextCompanyReviewsById[result.value.companyId] = result.value.reviews;
        }
      });

      setCompanyReviewsById(nextCompanyReviewsById);
    } catch (error) {
      console.error("Error al cargar información de reseñas:", error);
    } finally {
      setLoading(false);
    }
  }, [creator?.id]);

  useEffect(() => {
    if (isLoadingUser) return;

    if (creator?.id) {
      loadReviewsPageData();
    } else {
      setLoading(false);
    }
  }, [creator?.id, isLoadingUser, loadReviewsPageData]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : creator?.rating || 0;

  const hasReviewedCompany = (companyId: string) => {
    if (!creator) return false;
    return (
      companyReviewsById[companyId]?.some((review) => review.from === creator.publicName) || false
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedCompanyId || rating === 0 || !comment.trim() || !creator) return;

    setSubmitting(true);

    try {
      const newReview = await companiesService.addReview(selectedCompanyId, {
        from: creator.publicName,
        rating,
        comment: comment.trim(),
      });

      setCompanyReviewsById((prev) => ({
        ...prev,
        [selectedCompanyId]: [...(prev[selectedCompanyId] || []), newReview],
      }));

      setSelectedCompanyId(null);
      setRating(0);
      setHoverRating(0);
      setComment("");

      toast.success(t("creatorReviews.toastSuccess"));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error al enviar reseña:", error);
      toast.error(error.response?.data?.message || "Error al enviar reseña");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CreatorSidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED]/20 to-[#A78BFA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CreatorSidebar />

      <div className="flex-1 p-6 bg-gray-50 min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{t("creatorReviews.title")}</h1>
            <p className="text-gray-500 mt-1">{t("creatorReviews.subtitle")}</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value: string) => setActiveTab(value as "received" | "write")}
            className="w-full"
          >
            {/* Tabs */}
            <TabsList className="flex w-full mb-6 bg-transparent p-0 gap-0 border-0 rounded-none h-auto">
              <TabsTrigger
                value="received"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-0
                  text-gray-500 bg-transparent rounded-lg
                  data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-none
                  transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                {t("creatorReviews.tabs.received")}
              </TabsTrigger>
              <TabsTrigger
                value="write"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-0
                  text-gray-500 bg-transparent rounded-lg
                  data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-none
                  transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                {t("creatorReviews.tabs.write")}
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Reseñas Recibidas ── */}
            <TabsContent value="received" className="space-y-4">

              {/* Rating card */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-10 flex flex-col items-center justify-center text-white">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-white/20 rounded-full p-3">
                    <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  </div>
                  <span className="text-6xl font-bold">
                    {averageRating > 0 ? averageRating.toFixed(1) : t("creatorReviews.received.noRating")}
                  </span>
                </div>
                <p className="text-purple-100 text-base mt-1">
                  {t("creatorReviews.received.reviewCount", { count: reviews.length })}
                </p>
              </div>

              {/* Comentarios */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  {t("creatorReviews.received.commentsTitle")}
                </h2>

                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="font-semibold text-gray-700">{t("creatorReviews.received.empty.title")}</p>
                    <p className="text-sm text-gray-400 mt-1">{t("creatorReviews.received.empty.subtitle")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-5 bg-purple-50/60 rounded-xl border border-purple-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{review.from}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-gray-800">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Tab: Escribir Reseñas ── */}
            <TabsContent value="write" className="space-y-4">
              {collaboratedCompanies.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="font-semibold text-gray-700">{t("creatorReviews.write.noCollabs.title")}</p>
                  <p className="text-sm text-gray-400 mt-1">{t("creatorReviews.write.noCollabs.subtitle")}</p>
                </div>
              ) : (
                <>
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-4 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-sm font-semibold">{t("creatorReviews.write.banner.title")}</p>
                      <p className="text-xs text-purple-100">{t("creatorReviews.write.banner.subtitle")}</p>
                    </div>
                  </div>

                  {/* Cards empresas */}
                  <div className="space-y-3">
                    {collaboratedCompanies.map((company) => (
                      <div
                        key={company.id}
                        className={`bg-white rounded-xl shadow-sm p-5 border transition-all duration-200 ${
                          selectedCompanyId === company.id
                            ? "border-purple-300 ring-1 ring-purple-200"
                            : "border-gray-100 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover ring-1 ring-gray-200"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{company.name}</p>
                            <p className="text-xs text-gray-500">{company.sector}</p>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{t("creatorReviews.write.collabCompleted")}</span>
                          </div>
                        </div>

                        {selectedCompanyId === company.id ? (
                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                {t("creatorReviews.write.form.ratingLabel")}
                              </p>
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                  >
                                    <Star
                                      className={`w-7 h-7 transition-colors ${
                                        star <= (hoverRating || rating)
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-200"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                {t("creatorReviews.write.form.commentLabel")}
                              </p>
                              <Textarea
                                value={comment}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  setComment(e.target.value)
                                }
                                placeholder={t("creatorReviews.write.form.commentPlaceholder")}
                                className="min-h-[90px] resize-none text-sm border-gray-200 focus:border-purple-400 rounded-lg"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSubmitReview}
                                disabled={rating === 0 || !comment.trim() || submitting}
                                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t("creatorReviews.write.form.submitting")}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {t("creatorReviews.write.form.submitBtn")}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCompanyId(null);
                                  setRating(0);
                                  setHoverRating(0);
                                  setComment("");
                                }}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors"
                              >
                                {t("common.cancel")}
                              </button>
                            </div>
                          </div>
                        ) : hasReviewedCompany(company.id) ? (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">{t("creatorReviews.write.alreadyReviewed")}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedCompanyId(company.id)}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                          >
                            <Star className="w-3.5 h-3.5" />
                            {t("creatorReviews.write.writeBtn")}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}