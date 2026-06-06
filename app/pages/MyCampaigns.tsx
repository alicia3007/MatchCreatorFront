"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import type { Campaign, Application } from "@/app/context/UserContext";
import CompanySidebar from "@/app/components/CompanySidebar";
import { useRouter } from "next/navigation";
import {
  Briefcase, Users, ArrowRight, Edit, Power, PowerOff, Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { campaignsService, applicationsService } from "../api";

export default function MyCampaigns() {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applicantsCountById, setApplicantsCountById] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updatingCampaignId, setUpdatingCampaignId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadMyCampaigns();
    } else {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const loadMyCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignsService.getMine();
      setCampaigns(data);

      const counts = await Promise.allSettled(
        data.map((campaign: Campaign) => applicationsService.getByCampaign(campaign.id)),
      );
      const countsById: Record<string, number> = {};
      counts.forEach((result: PromiseSettledResult<Application[]>, index: number) => {
        if (result.status === "fulfilled") {
          countsById[data[index].id] = result.value.length;
        } else {
          countsById[data[index].id] = 0;
        }
      });

      setApplicantsCountById(countsById);
    } catch (error) {
      console.error("Error al cargar mis campañas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) =>
    status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600";

  const getStatusText = (status: string) =>
    status === "active" ? t("myCampaigns.status.active") : t("myCampaigns.status.closed");

  const handleEditCampaign = (campaignId: string) => {
    router.push(`/company/campaigns/new?campaignId=${campaignId}`);
  };

  const toggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "closed" : "active";
    setUpdatingCampaignId(campaign.id);
    try {
      const updatedCampaign = await campaignsService.updateStatus(campaign.id, newStatus);
      setCampaigns((prev) =>
        prev.map((item) => item.id === updatedCampaign.id ? updatedCampaign : item),
      );
    } catch (error) {
      console.error("Error al actualizar estado de campaña:", error);
    } finally {
      setUpdatingCampaignId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CompanySidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("myCampaigns.title")}</h1>
            <p className="text-gray-600">{t("myCampaigns.subtitle")}</p>
          </div>
          <button
            onClick={() => router.push("/company/campaigns/new")}
            className="px-6 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            {t("myCampaigns.newCampaign")}
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="w-16 h-16 text-[#0EA5E9] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900">{t("common.loading")}</h2>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("myCampaigns.empty.title")}</h2>
            <p className="text-gray-600 mb-6">{t("myCampaigns.empty.subtitle")}</p>
            <button
              onClick={() => router.push("/company/campaigns/new")}
              className="px-6 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              {t("myCampaigns.empty.createBtn")}
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaign.name}</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                          <button
                            onClick={() => toggleCampaignStatus(campaign)}
                            disabled={updatingCampaignId === campaign.id}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              campaign.status === "active"
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                            title={campaign.status === "active" ? t("myCampaigns.actions.closeCampaign") : t("myCampaigns.actions.activateCampaign")}
                          >
                            {updatingCampaignId === campaign.id ? (
                              <><Loader2 className="w-3 h-3 animate-spin" />{t("common.loading")}</>
                            ) : campaign.status === "active" ? (
                              <><PowerOff className="w-3 h-3" />{t("myCampaigns.actions.close")}</>
                            ) : (
                              <><Power className="w-3 h-3" />{t("myCampaigns.actions.activate")}</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{campaign.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0EA5E9]" />
                        <span className="font-semibold text-gray-900">
                          {t("myCampaigns.applicantsCount", {
                            count: applicantsCountById[campaign.id] ?? 0,
                          })}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        📅 {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                      {campaign.budget && (
                        <div className="text-gray-600">💰 {campaign.budget}</div>
                      )}
                    </div>

                    {campaign.creatorType && campaign.creatorType.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {campaign.creatorType.slice(0, 3).map((type, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {type}
                          </span>
                        ))}
                        {campaign.creatorType.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {t("myCampaigns.moreTypes", { count: campaign.creatorType.length - 3 })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col justify-end items-end gap-2">
                    <button
                      onClick={() => router.push(`/company/campaigns/${campaign.id}`)}
                      className="px-6 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap font-medium"
                    >
                      {t("myCampaigns.actions.viewDetail")}<ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditCampaign(campaign.id)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                    >
                      <Edit className="w-5 h-5" />{t("myCampaigns.actions.edit")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}