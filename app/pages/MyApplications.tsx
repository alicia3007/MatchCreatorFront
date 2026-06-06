"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import type {
  Application,
  Campaign,
} from "../context/UserContext";
import CreatorSidebar from "../components/CreatorSidebar";
import { useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  applicationsService,
  campaignsService,
} from "../api";

export default function MyApplications() {
  const { currentUser, isLoadingUser } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  const [applications, setApplications] = useState<Application[]>([]);
  const [campaignsById, setCampaignsById] = useState<Record<string, Campaign>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingUser) return;

    if (currentUser?.id) {
      loadMyApplications();
    } else {
      setLoading(false);
    }
  }, [currentUser?.id, isLoadingUser]);

  const loadMyApplications = async () => {
    setLoading(true);

    try {
      const data = await applicationsService.getMine();
      setApplications(data);

      const uniqueCampaignIds = Array.from(
        new Set(data.map((application) => application.campaignId)),
      );

      const campaignResults = await Promise.allSettled(
        uniqueCampaignIds.map((campaignId) =>
          campaignsService.getById(campaignId),
        ),
      );

      const nextCampaignsById: Record<string, Campaign> = {};

      campaignResults.forEach((result) => {
        if (result.status === "fulfilled") {
          nextCampaignsById[result.value.id] = result.value;
        }
      });

      setCampaignsById(nextCampaignsById);
    } catch (error) {
      console.error("Error al cargar aplicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "reviewing":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "confirmed":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return t("applications.status.sent");
      case "reviewing":
        return t("applications.status.reviewing");
      case "accepted":
        return t("applications.status.accepted");
      case "confirmed":
        return t("applications.status.confirmed");
      case "rejected":
        return t("applications.status.rejected");
      default:
        return status;
    }
  };

  const getStatusBarColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "confirmed":
        return "bg-emerald-500";
      case "reviewing":
        return "bg-yellow-400";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CreatorSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header sticky */}
        <div className="relative bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A78BFA] shadow-2xl sticky top-0 z-20">
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white mb-2 drop-shadow-lg flex items-center gap-3">
                  <FileText className="w-7 h-7" />
                  {t("applications.title")}
                </h1>
                <p className="text-white/95 text-base font-medium">
                  {t("myApplications.subtitle")}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30">
                <p className="text-white/90 text-sm font-semibold mb-1">
                  {t("availableCampaigns.header.results")}
                </p>
                <p className="text-3xl font-black text-white">
                  {applications.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-4 border-dashed border-gray-200">
              <div className="w-32 h-32 bg-gradient-to-br from-[#7C3AED]/20 to-[#A78BFA]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-16 h-16 text-[#7C3AED] animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
                {t("common.loading")}
              </h2>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-4 border-dashed border-gray-200">
              <div className="w-32 h-32 bg-gradient-to-br from-[#7C3AED]/20 to-[#A78BFA]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-16 h-16 text-[#7C3AED]" />
              </div>
              <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
                {t("applications.noApplications")}
              </h2>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {t("myApplications.emptyDescription")}
              </p>
              <button
                onClick={() => router.push("/creator/campaigns")}
                className="px-10 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                {t("myApplications.viewAvailableCampaigns")}
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((application) => {
                const campaign = campaignsById[application.campaignId];

                if (!campaign) return null;

                return (
                  <div
                    key={application.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-[#7C3AED] transform hover:-translate-y-1 flex min-h-[160px]"
                  >
                    <div
                      className={`w-2 flex-shrink-0 ${getStatusBarColor(application.status)}`}
                    />

                    <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                              {campaign.name}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building2 className="w-4 h-4" />
                              <span>{campaign.companyName}</span>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 ${getStatusColor(application.status)}`}
                          >
                            {getStatusText(application.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {t("applications.appliedOn")}{" "}
                            {application.appliedDate}
                          </span>
                        </div>

                        <p className="text-gray-700 line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>

                      <div className="flex md:flex-col justify-end md:justify-center items-end gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            router.push(
                              `/creator/applications/${application.id}`,
                            )
                          }
                          className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-lg font-bold flex items-center gap-2 whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                          {t("myApplications.viewDetail")}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}