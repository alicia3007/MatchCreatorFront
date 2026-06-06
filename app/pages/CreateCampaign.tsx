"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, Company, Campaign } from "@/app/context/UserContext";
import CompanySidebar from "@/app/components/CompanySidebar";
import { useTranslation } from "react-i18next";
import { campaignsService } from "../api";
import {
  Plus,
  X,
  CheckCircle,
  Loader2,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
} from "lucide-react";

const CATEGORY_KEYS = [
  "gaming",
  "fashion",
  "fitness",
  "education",
  "technology",
  "beauty",
  "food",
  "travel",
  "lifestyle",
  "entertainment",
  "sports",
  "music",
  "artDesign",
  "finance",
  "healthWellness",
  "pets",
  "humor",
  "business",
  "politics",
  "science",
  "nature",
  "photography",
  "architecture",
  "drinks",
  "maternity",
  "cars",
  "books",
  "sustainability",
  "spirituality",
  "diyHandcrafts",
];

const PLATFORM_OPTIONS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitch",
  "Facebook",
  "Twitter / X",
  "LinkedIn",
  "Pinterest",
  "Snapchat",
  "Podcast",
];

interface Deliverable {
  id: string;
  text: string;
}

type CampaignExtra = Campaign & {
  categories?: string[];
  requirements_list?: Deliverable[];
  deliverables?: Deliverable[];
};

function ImageUpload({
  label,
  hint,
  aspectClass,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  aspectClass: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <p className="text-xs text-gray-400 mb-3">{hint}</p>

      <div
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all group ${aspectClass} ${
          value
            ? "border-transparent"
            : "border-gray-300 hover:border-[#0EA5E9]"
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-medium">
                {t("createCampaign.images.changeImage")}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-red-50"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {t("createCampaign.images.clickToUpload")}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
        selected
          ? "bg-[#0EA5E9] text-white border-[#0EA5E9] shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-[#0EA5E9] hover:text-[#0EA5E9]"
      }`}
    >
      {label}
    </button>
  );
}

function SectionCard({
  icon,
  number,
  title,
  children,
}: {
  icon: React.ReactNode;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
          {icon}
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          <span className="text-[#0EA5E9] mr-1">{number}.</span> {title}
        </h2>
      </div>

      {children}
    </div>
  );
}

export default function CreateCampaign() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentUser, isLoadingUser } = useUser();
  const company = currentUser as Company | null;

  const editingCampaignId = searchParams.get("campaignId") ?? undefined;
  const isEditMode = !!editingCampaignId;

  const [loadingCampaign, setLoadingCampaign] = useState(isEditMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [requirements, setRequirements] = useState<Deliverable[]>([]);
  const [newRequirement, setNewRequirement] = useState("");

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [newDeliverable, setNewDeliverable] = useState("");

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaignToEdit = async () => {
      if (!editingCampaignId) {
        setLoadingCampaign(false);
        return;
      }

      setLoadingCampaign(true);

      try {
        const campaign = await campaignsService.getById(editingCampaignId);
        const campaignExtra = campaign as CampaignExtra;

        setName(campaign.name || "");
        setDescription(campaign.description || "");
        setBudget(campaign.budget || "");
        setCategories(campaignExtra.categories || campaign.creatorType || []);
        setPlatforms(campaign.socialPlatform || []);
        setStartDate(campaign.startDate || "");
        setEndDate(campaign.endDate || "");
        setRequirements(campaignExtra.requirements_list || []);
        setDeliverables(campaignExtra.deliverables || []);
        setMainImage(campaign.mainImage || null);
        setBannerImage(campaign.bannerImage || null);
      } catch (error) {
        console.error("Error al cargar campaña para editar:", error);
        setErrors((prev) => ({
          ...prev,
          submit: "Error al cargar la campaña",
        }));
      } finally {
        setLoadingCampaign(false);
      }
    };

    loadCampaignToEdit();
  }, [editingCampaignId]);

  const toggleCategory = (cat: string) =>
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const togglePlatform = (platform: string) =>
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );

  const addRequirement = () => {
    const text = newRequirement.trim();
    if (!text) return;

    setRequirements((prev) => [
      ...prev,
      { id: `r-${Date.now()}`, text },
    ]);
    setNewRequirement("");
  };

  const removeRequirement = (id: string) =>
    setRequirements((prev) => prev.filter((r) => r.id !== id));

  const updateRequirement = (id: string, text: string) =>
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, text } : r)),
    );

  const addDeliverable = () => {
    const text = newDeliverable.trim();
    if (!text) return;

    setDeliverables((prev) => [
      ...prev,
      { id: `d-${Date.now()}`, text },
    ]);
    setNewDeliverable("");
  };

  const removeDeliverable = (id: string) =>
    setDeliverables((prev) => prev.filter((d) => d.id !== id));

  const updateDeliverable = (id: string, text: string) =>
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, text } : d)),
    );

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = t("createCampaign.validation.nameRequired");
    }

    if (!description.trim()) {
      nextErrors.description = t(
        "createCampaign.validation.descriptionRequired",
      );
    }

    if (!budget.trim()) {
      nextErrors.budget = t("createCampaign.validation.budgetRequired");
    } else if (isNaN(Number(budget.replace(/[^0-9.]/g, "")))) {
      nextErrors.budget = t("createCampaign.validation.budgetInvalid");
    }

    if (categories.length === 0) {
      nextErrors.categories = t(
        "createCampaign.validation.categoriesRequired",
      );
    }

    if (platforms.length === 0) {
      nextErrors.platforms = t(
        "createCampaign.validation.platformsRequired",
      );
    }

    if (!startDate) {
      nextErrors.startDate = t(
        "createCampaign.validation.startDateRequired",
      );
    }

    if (!endDate) {
      nextErrors.endDate = t("createCampaign.validation.endDateRequired");
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      nextErrors.dateRange = t("createCampaign.validation.dateRange");
    }

    if (requirements.length === 0) {
      nextErrors.requirements = t(
        "createCampaign.validation.requirementsRequired",
      );
    }

    if (deliverables.length === 0) {
      nextErrors.deliverables = t(
        "createCampaign.validation.deliverablesRequired",
      );
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!company) return;
  if (!validate()) return;

  setIsLoading(true);
  setErrors((prev) => ({ ...prev, submit: "" }));

  try {
    const commonData = {
      name,
      description,
      objective: description,
      budget,
      creatorType: categories,
      socialPlatform: platforms,
      startDate,
      endDate,
      requirements: [
        ...requirements.map((r) => r.text),
        ...deliverables.map((d) => d.text),
      ],
      mainImage: mainImage ?? undefined,
      bannerImage: bannerImage ?? undefined,
    };

    if (isEditMode && editingCampaignId) {
      await campaignsService.update(editingCampaignId, commonData);
    } else {
      await campaignsService.create({
        ...commonData,
        companyId: company.id,
        companyName: company.name,
      });
    }

    setShowSuccess(true);

    setTimeout(() => {
      router.push("/company/campaigns");
    }, 2000);
  } catch (error) {
    console.error("Error al guardar campaña:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error al guardar la campaña";

    setErrors((prev) => ({ ...prev, submit: message }));
  } finally {
    setIsLoading(false);
  }
};
  if (isLoadingUser || loadingCampaign) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6]">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <CompanySidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {isEditMode
                ? t("createCampaign.title.edit")
                : t("createCampaign.title.create")}
            </h1>

            <p className="text-gray-500 text-sm">
              {isEditMode
                ? t("createCampaign.subtitle.edit")
                : t("createCampaign.subtitle.create")}
            </p>
          </div>

          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <SectionCard
                icon={<FileText className="w-5 h-5" />}
                number={1}
                title={t("createCampaign.sections.basicInfo")}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("createCampaign.fields.campaignName")}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t(
                        "createCampaign.placeholders.campaignName",
                      )}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        errors.name
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                      }`}
                    />

                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("createCampaign.fields.description")}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t(
                        "createCampaign.placeholders.description",
                      )}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none ${
                        errors.description
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                      }`}
                    />

                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={<DollarSign className="w-5 h-5" />}
                number={2}
                title={t("createCampaign.sections.payment")}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("createCampaign.fields.budget")}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                      $
                    </span>

                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        errors.budget
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                      }`}
                    />
                  </div>

                  {errors.budget && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.budget}
                    </p>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                icon={<Users className="w-5 h-5" />}
                number={3}
                title={t("createCampaign.sections.categories")}
              >
                <p className="text-xs text-gray-400 mb-4">
                  {t("createCampaign.hints.categories")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {CATEGORY_KEYS.map((key) => {
                    const label = t(`createCampaign.categories.${key}`);

                    return (
                      <Chip
                        key={key}
                        label={label}
                        selected={categories.includes(label)}
                        onToggle={() => toggleCategory(label)}
                      />
                    );
                  })}
                </div>

                {errors.categories && (
                  <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.categories}
                  </p>
                )}
              </SectionCard>

              <SectionCard
                icon={<Users className="w-5 h-5" />}
                number={4}
                title={t("createCampaign.sections.platforms")}
              >
                <p className="text-xs text-gray-400 mb-4">
                  {t("createCampaign.hints.platforms")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((platform) => (
                    <Chip
                      key={platform}
                      label={platform}
                      selected={platforms.includes(platform)}
                      onToggle={() => togglePlatform(platform)}
                    />
                  ))}
                </div>

                {errors.platforms && (
                  <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.platforms}
                  </p>
                )}
              </SectionCard>

              <SectionCard
                icon={<Calendar className="w-5 h-5" />}
                number={5}
                title={t("createCampaign.sections.duration")}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("createCampaign.fields.startDate")}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        errors.startDate
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                      }`}
                    />

                    {errors.startDate && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("createCampaign.fields.endDate")}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        errors.endDate
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                      }`}
                    />

                    {errors.endDate && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {errors.dateRange && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dateRange}
                  </p>
                )}
              </SectionCard>

              <SectionCard
                icon={<FileText className="w-5 h-5" />}
                number={6}
                title={t("createCampaign.sections.requirements")}
              >
                <p className="text-xs text-gray-400 mb-4">
                  {t("createCampaign.hints.requirements")}
                </p>

                {requirements.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {requirements.map((requirement, index) => (
                      <li
                        key={requirement.id}
                        className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 group"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>

                        <input
                          type="text"
                          value={requirement.text}
                          onChange={(e) =>
                            updateRequirement(
                              requirement.id,
                              e.target.value,
                            )
                          }
                          className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => removeRequirement(requirement.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                    placeholder={t(
                      "createCampaign.placeholders.requirement",
                    )}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                  />

                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-4 py-3 bg-[#0EA5E9] text-white rounded-xl hover:bg-[#0EA5E9]/90 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t("createCampaign.addBtn")}
                  </button>
                </div>

                {errors.requirements && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.requirements}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {t("createCampaign.hints.editHint")}
                </p>
              </SectionCard>

              <SectionCard
                icon={<Plus className="w-5 h-5" />}
                number={7}
                title={t("createCampaign.sections.deliverables")}
              >
                <p className="text-xs text-gray-400 mb-4">
                  {t("createCampaign.hints.deliverables")}
                </p>

                {deliverables.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {deliverables.map((deliverable, index) => (
                      <li
                        key={deliverable.id}
                        className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 group"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>

                        <input
                          type="text"
                          value={deliverable.text}
                          onChange={(e) =>
                            updateDeliverable(
                              deliverable.id,
                              e.target.value,
                            )
                          }
                          className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => removeDeliverable(deliverable.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDeliverable();
                      }
                    }}
                    placeholder={t(
                      "createCampaign.placeholders.deliverable",
                    )}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                  />

                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="px-4 py-3 bg-[#0EA5E9] text-white rounded-xl hover:bg-[#0EA5E9]/90 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t("createCampaign.addBtn")}
                  </button>
                </div>

                {errors.deliverables && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deliverables}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {t("createCampaign.hints.editHint")}
                </p>
              </SectionCard>

              <SectionCard
                icon={<ImageIcon className="w-5 h-5" />}
                number={8}
                title={t("createCampaign.sections.images")}
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <ImageUpload
                    label={t("createCampaign.images.mainLabel")}
                    hint={t("createCampaign.images.mainHint")}
                    aspectClass="h-56"
                    value={mainImage}
                    onChange={setMainImage}
                  />

                  <ImageUpload
                    label={t("createCampaign.images.bannerLabel")}
                    hint={t("createCampaign.images.bannerHint")}
                    aspectClass="h-56"
                    value={bannerImage}
                    onChange={setBannerImage}
                  />
                </div>
              </SectionCard>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3 pt-2 pb-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEditMode
                        ? t("createCampaign.submit.saving")
                        : t("createCampaign.submit.publishing")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {isEditMode
                        ? t("createCampaign.submit.saveChanges")
                        : t("createCampaign.submit.publish")}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/company/campaigns")}
                  className="px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isEditMode
                  ? t("createCampaign.success.titleEdit")
                  : t("createCampaign.success.titleCreate")}
              </h2>

              <p className="text-gray-500 mb-6 text-sm">
                {isEditMode
                  ? t("createCampaign.success.subtitleEdit")
                  : t("createCampaign.success.subtitleCreate")}
              </p>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-left space-y-1">
                <p className="text-sm text-green-700">
                  ✓{" "}
                  {isEditMode
                    ? t("createCampaign.success.check1Edit")
                    : t("createCampaign.success.check1Create")}
                </p>

                <p className="text-sm text-green-700">
                  ✓{" "}
                  {isEditMode
                    ? t("createCampaign.success.check2Edit")
                    : t("createCampaign.success.check2Create")}
                </p>

                <p className="text-sm text-green-700">
                  ✓{" "}
                  {isEditMode
                    ? t("createCampaign.success.check3Edit")
                    : t("createCampaign.success.check3Create")}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}