"use client";
import { useEffect, useState } from "react";
import { useUser, Company, Creator, Review } from "@/app/context/UserContext";
import CompanySidebar from "@/app/components/CompanySidebar";
import {
  Star, MessageSquare, Users, CheckCircle, Sparkles, Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  applicationsService,
  campaignsService,
  companiesService,
  creatorsService,
} from "../api";
import type { Application } from "@/app/context/UserContext";

export default function CompanyReviews() {
  const { currentUser, isLoadingUser } = useUser();
  const company = currentUser as Company | null;
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"received" | "write">("received");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [collaboratedCreators, setCollaboratedCreators] = useState<Creator[]>([]);
  const [creatorReviewsById, setCreatorReviewsById] = useState<Record<string, Review[]>>({});

  useEffect(() => {
    if (isLoadingUser) return;
    if (company?.id) {
      loadReviewsPageData();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id, isLoadingUser]);

  const loadReviewsPageData = async () => {
    if (!company?.id) return;
    setLoading(true);
    try {
      const [companyReviews, companyCampaigns] = await Promise.all([
        companiesService.getReviews(company.id),
        campaignsService.getMine(),
      ]);

      setReviews(companyReviews);

      const applicationsResults = await Promise.allSettled(
        companyCampaigns.map((campaign) =>
          applicationsService.getByCampaignAuth(campaign.id),
        ),
      );

      const confirmedApplications = applicationsResults
        .filter((result): result is PromiseFulfilledResult<Application[]> =>
          result.status === "fulfilled",
        )
        .flatMap((result) => result.value)
        .filter((application) => application.status === "confirmed");

      const uniqueCreatorIds = Array.from(
        new Set(confirmedApplications.map((application) => application.creatorId)),
      );

      const creatorResults = await Promise.allSettled(
        uniqueCreatorIds.map((creatorId) => creatorsService.getById(creatorId)),
      );

      const creators = creatorResults
        .filter((result): result is PromiseFulfilledResult<Creator> =>
          result.status === "fulfilled",
        )
        .map((result) => result.value);

      setCollaboratedCreators(creators);

      const creatorReviewResults = await Promise.allSettled(
        creators.map(async (creator) => {
          const creatorReviews = await creatorsService.getReviews(creator.id);
          return { creatorId: creator.id, reviews: creatorReviews };
        }),
      );

      const nextCreatorReviewsById: Record<string, Review[]> = {};
      creatorReviewResults.forEach((result) => {
        if (result.status === "fulfilled") {
          nextCreatorReviewsById[result.value.creatorId] = result.value.reviews;
        }
      });

      setCreatorReviewsById(nextCreatorReviewsById);
    } catch (error) {
      console.error("Error al cargar información de reseñas:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : company?.rating ?? 0;

  const hasReviewedCreator = (creatorId: string) => {
    if (!company) return false;
    return creatorReviewsById[creatorId]?.some((review) => review.from === company.name) ?? false;
  };

  const handleSubmitReview = async () => {
    if (!selectedCreatorId || rating === 0 || !comment.trim() || !company) return;
    setSubmitting(true);
    try {
      const newReview = await creatorsService.addReview(selectedCreatorId, {
        from: company.name,
        rating,
        comment: comment.trim(),
      });

      setCreatorReviewsById((prev) => ({
        ...prev,
        [selectedCreatorId]: [...(prev[selectedCreatorId] ?? []), newReview],
      }));

      setSelectedCreatorId(null);
      setRating(0);
      setHoverRating(0);
      setComment("");
      toast.success(t("companyReviews.toast.reviewSubmitted"));
    } catch (error) {
      console.error("Error al enviar reseña:", error);
      const message = error instanceof Error ? error.message : "Error al enviar reseña";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanySidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border-0 p-14 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-sm text-gray-600">{t("common.loading")}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CompanySidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">

          {/* ── TÍTULO ── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("companyReviews.title")}</h1>
            <p className="text-gray-600">{t("companyReviews.subtitle")}</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value: string) => setActiveTab(value as "received" | "write")}
            className="w-full"
          >
            {/* ── TABS ── */}
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/60 backdrop-blur-sm p-1 rounded-xl">
              <TabsTrigger
                value="received"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t("companyReviews.tabs.received")}
              </TabsTrigger>
              <TabsTrigger
                value="write"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t("companyReviews.tabs.write")}
              </TabsTrigger>
            </TabsList>

            {/* ── RECEIVED ── */}
            <TabsContent value="received" className="space-y-6">

              {/* Banner rating */}
              <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-xl p-8 border-0">
                <div className="text-center text-white">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                      <Star className="w-10 h-10 text-yellow-300 fill-yellow-300" />
                    </div>
                    <span className="text-7xl font-bold">
                      {averageRating > 0 ? averageRating.toFixed(1) : t("companyReviews.notAvailable")}
                    </span>
                  </div>
                  <p className="text-xl text-blue-100">
                    {reviews.length}{" "}
                    {reviews.length === 1 ? t("companyReviews.reviewSingular") : t("companyReviews.reviewPlural")}
                  </p>
                </div>
              </Card>

              {/* Lista de reseñas */}
              <Card className="bg-white rounded-2xl shadow-lg p-8 border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  {t("companyReviews.comments")}
                </h2>

                {reviews.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("companyReviews.emptyReceived.title")}</h3>
                    <p className="text-gray-600">{t("companyReviews.emptyReceived.subtitle")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{review.from}</h3>
                            <p className="text-sm text-gray-500 mt-1">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-gray-900">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ── WRITE ── */}
            <TabsContent value="write" className="space-y-6">
              {collaboratedCreators.length === 0 ? (
                <Card className="bg-white rounded-2xl shadow-lg p-12 border-0">
                  <div className="text-center">
                    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("companyReviews.emptyWrite.title")}</h3>
                    <p className="text-gray-600">{t("companyReviews.emptyWrite.subtitle")}</p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Banner share experience */}
                  <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-xl p-6 border-0">
                    <div className="flex items-center gap-3 text-white">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t("companyReviews.shareExperience.title")}</h3>
                        <p className="text-sm text-blue-100">{t("companyReviews.shareExperience.subtitle")}</p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid gap-6">
                    {collaboratedCreators.map((creator) => (
                      <Card
                        key={creator.id}
                        className={`p-6 border-2 transition-all duration-300 ${
                          selectedCreatorId === creator.id
                            ? "border-blue-500 bg-blue-50 shadow-xl"
                            : "border-transparent bg-white hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-16 h-16 rounded-xl object-cover ring-2 ring-blue-200"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{creator.publicName}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {creator.contentType.slice(0, 3).map((type) => (
                                <span key={type} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {type}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">
                                {t("companyReviews.creatorCard.completedCollaboration")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedCreatorId === creator.id ? (
                          <div className="space-y-4 mt-6 pt-6 border-t border-blue-200">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-3">
                                {t("companyReviews.form.rating")}
                              </label>
                              <div className="flex gap-2">
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
                                      className={`w-10 h-10 transition-colors ${
                                        star <= (hoverRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                {t("companyReviews.form.comment")}
                              </label>
                              <Textarea
                                value={comment}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                                placeholder={t("companyReviews.form.commentPlaceholder")}
                                className="min-h-[120px] resize-none border-blue-200 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleSubmitReview}
                                disabled={rating === 0 || !comment.trim() || submitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all"
                              >
                                {submitting ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t("companyReviews.form.submitting")}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    {t("companyReviews.form.submit")}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => { setSelectedCreatorId(null); setRating(0); setHoverRating(0); setComment(""); }}
                                className="px-4 py-2.5 border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-all"
                              >
                                {t("companyReviews.form.cancel")}
                              </button>
                            </div>
                          </div>
                        ) : hasReviewedCreator(creator.id) ? (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">{t("companyReviews.alreadyReviewed")}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedCreatorId(creator.id)}
                            className="w-full py-2.5 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg shadow-md flex items-center justify-center gap-2 font-semibold transition-all"
                          >
                            <Star className="w-4 h-4" />
                            {t("companyReviews.writeReviewButton")}
                          </button>
                        )}
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}