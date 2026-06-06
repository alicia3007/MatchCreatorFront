"use client";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useTranslation } from "react-i18next";
import CreatorSidebar from "@/app/components/CreatorSidebar";
import {
  Building2,
  Calendar,
  DollarSign,
  Target,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  applicationsService,
  campaignsService,
  messagesService,
} from "../api";
import type {
  Application,
  Campaign,
} from "@/app/context/UserContext";

export default function ApplicationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser, addConversation, addMessage } = useUser();

  const [application, setApplication] = useState<Application | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // CARGAR DATOS DEL BACKEND
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const loadData = async () => {
      const resolvedId = Array.isArray(id) ? id[0] : id;
      if (!resolvedId) return;

      try {
        setIsLoading(true);
        const app = await applicationsService.getById(resolvedId);
        setApplication(app);

        const camp = await campaignsService.getById(app.campaignId);
        setCampaign(camp);
      } catch (error) {
        console.error("Error al cargar la aplicación:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <CreatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!application || !campaign) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <CreatorSidebar />
        <div className="flex-1 max-w-4xl mx-auto p-6">
          <p className="text-center text-gray-600">
            {t("applications.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "reviewing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    return t(`applications.status.${status}`, {
      defaultValue: status,
    });
  };

  const handleAcceptCollaboration = async () => {
    if (!currentUser || !campaign || !application) return;

    try {
      setIsActing(true);

      // 1. Actualizar estado en el backend
      const updated = await applicationsService.updateStatus(
        application.id,
        "confirmed",
      );
      setApplication(updated);

      // 2. Obtener o crear conversación con la empresa
      const conversation = await messagesService.getOrCreateConversation({
        currentUserId: currentUser.id,
        currentUserType: "creator",
        otherUserId: campaign.companyId,
        otherUserType: "company",
      });

      // 3. Sincronizar conversación en el contexto local
      addConversation(conversation);

      // 4. Enviar mensaje
      const message = await messagesService.sendMessage({
        conversationId: conversation.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: (currentUser as { avatar?: string }).avatar ?? "",
        text: t("applications.acceptMessage", {
          campaignName: campaign.name,
        }),
      });

      addMessage(message);
      toast.success(t("applications.acceptToast"));

      setTimeout(() => {
        router.push("/creator/messages");
      }, 1500);
    } catch (error) {
      console.error("Error al aceptar colaboración:", error);
      toast.error("Error al aceptar la colaboración");
    } finally {
      setIsActing(false);
    }
  };

  const handleRejectCollaboration = async () => {
    if (!confirm(t("applications.rejectConfirm"))) return;
    if (!application) return;

    try {
      setIsActing(true);
      const updated = await applicationsService.updateStatus(
        application.id,
        "rejected",
      );
      setApplication(updated);
      toast.success(t("applications.rejectToast"));

      setTimeout(() => {
        router.push("/creator/applications");
      }, 1500);
    } catch (error) {
      console.error("Error al rechazar colaboración:", error);
      toast.error("Error al rechazar la colaboración");
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <CreatorSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => router.push("/creator/applications")}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("applications.backToApplications")}
          </button>

          {/* Status Banner */}
          <div
            className={`border-2 rounded-2xl p-6 mb-6 ${getStatusColor(application.status)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {t("applications.statusLabel")}:{" "}
                  {getStatusText(application.status)}
                </h2>
                <p className="text-sm">
                  {t("applications.appliedOn")}{" "}
                  {application.appliedDate}
                </p>
              </div>
              {application.status === "accepted" && (
                <CheckCircle className="w-12 h-12" />
              )}
              {application.status === "rejected" && (
                <XCircle className="w-12 h-12" />
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {campaign.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-5 h-5" />
                <span className="text-lg">{campaign.companyName}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t("applications.campaignDescription")}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {campaign.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t("applications.budget")}
                  </h3>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {campaign.budget}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t("applications.dates")}
                  </h3>
                </div>
                <p className="text-gray-700">
                  {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                  {new Date(campaign.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t("applications.objective")}
                  </h3>
                </div>
                <p className="text-gray-700">{campaign.objective}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t("applications.totalApplicants")}
                  </h3>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {campaign.applicants.length}
                </p>
              </div>
            </div>

            {application.status === "accepted" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("applications.nextStep")}
                </h2>
                <div className="flex gap-4">
                  <button
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                    onClick={handleAcceptCollaboration}
                    disabled={isActing}
                  >
                    {isActing ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      t("applications.acceptCollaboration")
                    )}
                  </button>
                  <button
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:opacity-50"
                    onClick={handleRejectCollaboration}
                    disabled={isActing}
                  >
                    {t("applications.rejectCollaboration")}
                  </button>
                </div>
              </div>
            )}

            {application.status === "sent" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-semibold">
                  {t("applications.sentTitle")}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  {t("applications.sentDesc")}
                </p>
              </div>
            )}

            {application.status === "reviewing" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 font-semibold">
                  {t("applications.reviewingTitle")}
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  {t("applications.reviewingDesc")}
                </p>
              </div>
            )}

            {application.status === "rejected" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-900 font-semibold">
                  {t("applications.rejectedTitle")}
                </p>
                <p className="text-red-700 text-sm mt-1">
                  {t("applications.rejectedDesc")}
                </p>
              </div>
            )}

            {application.status === "confirmed" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-900 font-semibold">
                  {t("applications.confirmedTitle")}
                </p>
                <p className="text-emerald-700 text-sm mt-1">
                  {t("applications.confirmedDesc")}
                </p>
                <button
                  onClick={() => router.push("/creator/messages")}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
                >
                  {t("applications.goToMessages")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}