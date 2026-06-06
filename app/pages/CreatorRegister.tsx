"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, Creator } from "../context/UserContext";
import {
  ArrowLeft,
  CheckCircle,
  User,
  Eye,
  EyeOff,
  XCircle,
  AlertCircle,
  Users,
  X,
  Upload,
  Image as ImageIcon,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  GraduationCap,
  Loader2,
  Plus,
} from "lucide-react";
import Image from "next/image";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { authService, creatorsService } from "../api";

interface SocialPlatform {
  platform: string;
  username: string;
  followers: string;
}

interface Pricing {
  platform: string;
  perPost: string;
  perStory: string;
  perLive: string;
}

interface PortfolioItem {
  id: string;
  url: string;
  preview: string;
}

export default function CreatorRegister() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userType, currentUser, setUserType, setCurrentUser } = useUser();

  const isEditMode = userType === "creator" && currentUser;
  const existingCreator = isEditMode ? (currentUser as Creator) : null;

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    contentTypes: "",
    age: "",
    birthDate: "",
    location: "",
    education: "",
    experienceDescription: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>([]);
  const [pricingList, setPricingList] = useState<Pricing[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const contentCategories = [
    t("categories.fashion"),
    t("categories.gaming"),
    t("categories.tech"),
    t("categories.beauty"),
    t("categories.fitness"),
    t("categories.food"),
    t("categories.travel"),
    t("categories.music"),
    t("creatorRegister.categories.art"),
    t("categories.education"),
  ];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (existingCreator) {
      setFormData({
        name: existingCreator.name || "",
        email: existingCreator.email || "",
        password: "",
        confirmPassword: "",
        username: existingCreator.publicName || "",
        contentTypes: existingCreator.contentType.join(", ") || "",
        age: existingCreator.age?.toString() || "",
        birthDate: existingCreator.birthDate || "",
        location: existingCreator.city || "",
        education: existingCreator.education || "",
        experienceDescription: existingCreator.experience || "",
      });
      setAvatarPreview(existingCreator.avatar || "");
      setSelectedCategories(existingCreator.contentType || []);

      if (existingCreator.socialMedia && existingCreator.socialMedia.length > 0) {
        setSocialPlatforms(
          existingCreator.socialMedia.map((sm) => ({
            platform: sm.platform,
            username: sm.url || "",
            followers: sm.followers?.toString() || "0",
          })),
        );
      }

      if (existingCreator.portfolio && existingCreator.portfolio.length > 0) {
        setPortfolio(
          existingCreator.portfolio.map((url, index) => ({
            id: `portfolio-existing-${index}`,
            url: url,
            preview: url,
          })),
        );
      }
    }
  }, [existingCreator]);

  const validateField = useCallback(
    (name: string, value: string) => {
      let error = "";

      switch (name) {
        case "name":
          if (!value.trim())
            error = t("creatorRegister.validation.nameRequired");
          else if (value.trim().length < 3)
            error = t("creatorRegister.validation.nameMin");
          break;
        case "email":
          if (!value.trim())
            error = t("creatorRegister.validation.emailRequired");
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            error = t("errors.invalidEmail");
          break;
        case "password":
          if (!isEditMode) {
            if (!value) error = t("creatorRegister.validation.passwordRequired");
            else if (value.length < 8) error = t("creatorRegister.validation.passwordMin");
          } else if (value && value.length < 8) {
            error = t("creatorRegister.validation.passwordMin");
          }
          break;
        case "confirmPassword":
          if (!isEditMode) {
            if (!value) error = t("creatorRegister.validation.confirmPasswordRequired");
            else if (value !== formData.password) error = t("errors.passwordMismatch");
          } else if (formData.password && value !== formData.password) {
            error = t("errors.passwordMismatch");
          }
          break;
        case "username":
          if (!value.trim()) error = t("creatorRegister.validation.usernameRequired");
          else if (!value.trim().startsWith("@"))
            error = t("creatorRegister.validation.usernameAt");
          break;
        case "contentTypes":
          if (!value.trim()) error = t("creatorRegister.validation.contentTypesRequired");
          break;
        case "age":
          if (!value) error = t("creatorRegister.validation.ageRequired");
          else if (parseInt(value) < 13) error = t("creatorRegister.validation.ageMin");
          else if (parseInt(value) > 120) error = t("creatorRegister.validation.ageInvalid");
          break;
        case "birthDate":
          if (!value) error = t("creatorRegister.validation.birthDateRequired");
          break;
        case "location":
          if (!value.trim()) error = t("creatorRegister.validation.locationRequired");
          break;
        case "education":
          if (!value.trim()) error = t("creatorRegister.validation.educationRequired");
          break;
        case "experienceDescription":
          if (!value.trim()) error = t("creatorRegister.validation.experienceRequired");
          else if (value.trim().length < 20)
            error = t("creatorRegister.validation.experienceMin");
          break;
      }

      return error;
    },
    [isEditMode, formData.password, t],
  );

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSocialPlatform = () => {
    setSocialPlatforms([...socialPlatforms, { platform: "", username: "", followers: "" }]);
  };

  const handleRemoveSocialPlatform = (index: number) => {
    setSocialPlatforms(socialPlatforms.filter((_, i) => i !== index));
  };

  const handleSocialPlatformChange = (
    index: number,
    field: keyof SocialPlatform,
    value: string,
  ) => {
    const updated = [...socialPlatforms];
    if (field === "followers" && value !== "") {
      const numValue = parseFloat(value);
      if (numValue < 0) return;
    }
    updated[index][field] = value;
    setSocialPlatforms(updated);
  };

  const handleAddPricing = () => {
    setPricingList([...pricingList, { platform: "", perPost: "", perStory: "", perLive: "" }]);
  };

  const handleRemovePricing = (index: number) => {
    setPricingList(pricingList.filter((_, i) => i !== index));
  };

  const handlePricingChange = (index: number, field: keyof Pricing, value: string) => {
    const updated = [...pricingList];
    if (
      (field === "perPost" || field === "perStory" || field === "perLive") &&
      value !== ""
    ) {
      const numValue = parseFloat(value);
      if (numValue < 0) return;
    }
    updated[index][field] = value;
    setPricingList(updated);
  };

  const handlePortfolioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: PortfolioItem = {
          id: `portfolio-${Date.now()}`,
          url: reader.result as string,
          preview: reader.result as string,
        };
        setPortfolio([...portfolio, newItem]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePortfolioItem = (id: string) => {
    setPortfolio(portfolio.filter((item) => item.id !== id));
  };

  const isFormValid = useCallback(() => {
    const basicFieldsValid = Object.keys(formData).every((key) => {
      if (isEditMode && (key === "password" || key === "confirmPassword")) return true;
      const error = validateField(key, formData[key as keyof typeof formData]);
      return !error;
    });
    const hasAvatar = !!avatarPreview;
    const hasSocialPlatform =
      socialPlatforms.length > 0 &&
      socialPlatforms.every((p) => p.platform && p.username && p.followers);
    const hasPricing =
      pricingList.length > 0 &&
      pricingList.every((p) => p.platform && (p.perPost || p.perStory || p.perLive));
    const hasPortfolio = portfolio.length > 0;
    return basicFieldsValid && hasAvatar && hasSocialPlatform && hasPricing && hasPortfolio;
  }, [formData, isEditMode, validateField, avatarPreview, socialPlatforms, pricingList, portfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      if (isEditMode && existingCreator) {
        const updatedCreatorData: Partial<Creator> = {
          name: formData.name,
          email: formData.email,
          avatar: avatarPreview || existingCreator.avatar,
          publicName: formData.username,
          bio: formData.experienceDescription,
          contentType: formData.contentTypes.split(",").map((item) => item.trim()),
          socialMedia: socialPlatforms.map((platform) => ({
            platform: platform.platform,
            followers: parseInt(platform.followers) || 0,
            url: platform.username,
          })),
          experience: formData.experienceDescription,
          portfolio: portfolio.map((item) => item.url),
          age: formData.age ? parseInt(formData.age) : undefined,
          birthDate: formData.birthDate,
          city: formData.location,
          education: formData.education,
          pricing: pricingList.map((pricing) => ({
            platform: pricing.platform,
            perPost: parseFloat(pricing.perPost) || 0,
            perStory: parseFloat(pricing.perStory) || 0,
            perLive: parseFloat(pricing.perLive) || 0,
          })),
        };

        const updatedCreator = await creatorsService.update(
          existingCreator.id,
          updatedCreatorData,
        );

        setCurrentUser(updatedCreator);
        setShowSuccess(true);

        setTimeout(() => {
          router.push("/creator/profile");
        }, 2000);
      } else {
        const creatorData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          avatar: avatarPreview,  // ✅ FIX: avatar ahora se envía al backend
          publicName: formData.username,
          bio: formData.experienceDescription,
          contentType: formData.contentTypes.split(",").map((item) => item.trim()),
          socialMedia: socialPlatforms.map((platform) => ({
            platform: platform.platform,
            followers: parseInt(platform.followers) || 0,
            url: platform.username,
          })),
          experience: formData.experienceDescription,
          portfolio: portfolio.map((item) => item.url),
          availability: "Disponible",
          age: formData.age ? parseInt(formData.age) : undefined,
          birthDate: formData.birthDate,
          city: formData.location,
          education: formData.education,
          pricing: pricingList.map((pricing) => ({
            platform: pricing.platform,
            perPost: parseFloat(pricing.perPost) || 0,
            perStory: parseFloat(pricing.perStory) || 0,
            perLive: parseFloat(pricing.perLive) || 0,
          })),
        };

        const response = await authService.registerCreator(creatorData);

        setUserType(response.userType);
        setCurrentUser(response.profile);

        setShowSuccess(true);

        setTimeout(() => {
          router.push("/creator/profile");
        }, 2000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error al guardar creador:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || "Error al guardar la información",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldStatus = (name: string) => {
    if (!touched[name]) return "default";
    if (errors[name]) return "error";
    if (formData[name as keyof typeof formData]) return "success";
    return "default";
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <main className="w-full">
        {/* Header */}
        <header className="px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-[#E5E7EB]">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <button
              onClick={() => router.push(isEditMode ? "/creator/profile" : "/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {isEditMode ? t("creatorRegister.header.backToProfile") : t("common.back")}
            </button>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Image
                src="/match-creator-logo.png"
                alt="MatchCreator"
                width={56}
                height={56}
                className="h-14 w-auto"
              />
            </div>
            <div className="w-32">
              {!isEditMode && (
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2 text-gray-700 hover:text-[#7C3AED] font-medium transition-colors"
                >
                  {t("creatorRegister.header.alreadyHaveAccount")}
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="px-6 py-8 max-w-5xl mx-auto">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
              {isEditMode
                ? t("creatorRegister.title.edit")
                : t("creatorRegister.title.create")}
            </h1>
            <p className="text-gray-600">
              {isEditMode
                ? t("creatorRegister.subtitle.edit")
                : t("creatorRegister.subtitle.create")}
            </p>
          </div>

          {/* INFO BLOCK */}
          <div className="mb-8 bg-[#F9FAFB] rounded-lg p-6 border border-[#E5E7EB]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F2937] mb-2">
                  {isEditMode
                    ? t("creatorRegister.infoBlock.edit.title")
                    : t("creatorRegister.infoBlock.create.title")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {isEditMode
                        ? t("creatorRegister.infoBlock.edit.check1")
                        : t("creatorRegister.infoBlock.create.check1")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {isEditMode
                        ? t("creatorRegister.infoBlock.edit.check2")
                        : t("creatorRegister.infoBlock.create.check2")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {isEditMode
                        ? t("creatorRegister.infoBlock.edit.check3")
                        : t("creatorRegister.infoBlock.create.check3")}
                    </span>
                  </li>
                  {!isEditMode && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{t("creatorRegister.infoBlock.create.check4")}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECCIÓN 1: Información Básica */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-xl p-8 border-2 border-[#A78BFA]/30 hover:border-[#A78BFA] transition-colors">
                <h2 className="text-2xl font-bold text-[#7C3AED] mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[#A78BFA]/20 rounded-xl">
                    <User className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  {t("creatorRegister.sections.basicInfo")}
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("creatorRegister.fields.name")} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("name", e.target.value)
                      }
                      onBlur={() => handleBlur("name")}
                      placeholder={t("creatorRegister.placeholders.name")}
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all bg-white text-gray-900 placeholder-gray-400 ${
                        getFieldStatus("name") === "error"
                          ? "border-red-400"
                          : getFieldStatus("name") === "success"
                            ? "border-green-400"
                            : "border-gray-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#A78BFA]/30"
                      }`}
                    />
                    {touched.name && errors.name && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <XCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("creatorRegister.fields.email")} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("email", e.target.value)
                      }
                      onBlur={() => handleBlur("email")}
                      placeholder={t("creatorRegister.placeholders.email")}
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all bg-white text-gray-900 placeholder-gray-400 ${
                        getFieldStatus("email") === "error"
                          ? "border-red-400"
                          : getFieldStatus("email") === "success"
                            ? "border-green-400"
                            : "border-gray-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#A78BFA]/30"
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <XCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {!isEditMode && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                          {t("creatorRegister.fields.password")} *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFieldChange("password", e.target.value)
                            }
                            onBlur={() => handleBlur("password")}
                            placeholder={t("creatorRegister.placeholders.password")}
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                              getFieldStatus("password") === "error"
                                ? "border-red-500"
                                : getFieldStatus("password") === "success"
                                  ? "border-green-500"
                                  : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {touched.password && errors.password && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                          {t("creatorRegister.fields.confirmPassword")} *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFieldChange("confirmPassword", e.target.value)
                            }
                            onBlur={() => handleBlur("confirmPassword")}
                            placeholder={t("creatorRegister.placeholders.confirmPassword")}
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                              getFieldStatus("confirmPassword") === "error"
                                ? "border-red-500"
                                : getFieldStatus("confirmPassword") === "success"
                                  ? "border-green-500"
                                  : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("creatorRegister.fields.username")} *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("username", e.target.value)
                      }
                      onBlur={() => handleBlur("username")}
                      placeholder={t("creatorRegister.placeholders.username")}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                        getFieldStatus("username") === "error"
                          ? "border-red-500"
                          : getFieldStatus("username") === "success"
                            ? "border-green-500"
                            : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                      }`}
                    />
                    {touched.username && errors.username && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-3">
                      {t("creatorRegister.fields.contentTypes")}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {contentCategories.map((category) => (
                        <label
                          key={category}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedCategories.includes(category)
                              ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg"
                              : "bg-white border-gray-200 text-gray-700 hover:border-[#A78BFA]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (e.target.checked) {
                                const newCategories = [...selectedCategories, category];
                                setSelectedCategories(newCategories);
                                handleFieldChange("contentTypes", newCategories.join(", "));
                              } else {
                                const newCategories = selectedCategories.filter(
                                  (c) => c !== category,
                                );
                                setSelectedCategories(newCategories);
                                handleFieldChange("contentTypes", newCategories.join(", "));
                              }
                            }}
                            className="hidden"
                          />
                          <CheckCircle
                            className={`w-5 h-5 flex-shrink-0 ${
                              selectedCategories.includes(category) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <span className="font-medium">{category}</span>
                        </label>
                      ))}
                    </div>
                    {touched.contentTypes && errors.contentTypes && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <XCircle className="w-3 h-3" />
                        {errors.contentTypes}
                      </p>
                    )}
                    {selectedCategories.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {t("creatorRegister.fields.selectedCategories")}:{" "}
                        {selectedCategories.join(", ")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("creatorRegister.fields.avatar")} *
                    </label>
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                      {avatarPreview ? (
                        <div className="space-y-3">
                          <Image
                            src={avatarPreview}
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="object-cover mx-auto rounded-full"
                          />
                          <button
                            type="button"
                            onClick={() => setAvatarPreview("")}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            {t("creatorRegister.avatar.remove")}
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            {t("creatorRegister.avatar.uploadPrompt")}
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="inline-block px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] cursor-pointer transition-colors"
                          >
                            {t("creatorRegister.avatar.selectFile")}
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#F3F4F6] hover:border-[#A78BFA] transition-colors">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[#A78BFA]/10 rounded-xl">
                    <Users className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  {t("creatorRegister.sections.socialMedia")}
                </h2>

                <div className="space-y-4">
                  {socialPlatforms.map((platform, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">
                          {t("creatorRegister.social.itemLabel", { number: index + 1 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialPlatform(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={platform.platform}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSocialPlatformChange(index, "platform", e.target.value)
                          }
                          placeholder={t("creatorRegister.social.platformPlaceholder")}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                        <input
                          type="text"
                          value={platform.username}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSocialPlatformChange(index, "username", e.target.value)
                          }
                          placeholder={t("creatorRegister.social.usernamePlaceholder")}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                        <input
                          type="number"
                          value={platform.followers}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSocialPlatformChange(index, "followers", e.target.value)
                          }
                          placeholder={t("creatorRegister.social.followersPlaceholder")}
                          min="0"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddSocialPlatform}
                    className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-[#7C3AED] font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t("creatorRegister.social.addBtn")}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-8 border border-purple-200">
                <h2 className="text-2xl font-bold text-[#7C3AED] mb-6 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  {t("creatorRegister.sections.personalInfo")}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("creatorRegister.fields.age")} *
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("age", e.target.value)
                      }
                      onBlur={() => handleBlur("age")}
                      placeholder={t("creatorRegister.placeholders.age")}
                      min="13"
                      max="120"
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                        getFieldStatus("age") === "error"
                          ? "border-red-500"
                          : getFieldStatus("age") === "success"
                            ? "border-green-500"
                            : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                      }`}
                    />
                    {touched.age && errors.age && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.age}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t("creatorRegister.fields.birthDate")} *
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("birthDate", e.target.value)
                      }
                      onBlur={() => handleBlur("birthDate")}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                        getFieldStatus("birthDate") === "error"
                          ? "border-red-500"
                          : getFieldStatus("birthDate") === "success"
                            ? "border-green-500"
                            : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                      }`}
                    />
                    {touched.birthDate && errors.birthDate && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.birthDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {t("creatorRegister.fields.location")} *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("location", e.target.value)
                      }
                      onBlur={() => handleBlur("location")}
                      placeholder={t("creatorRegister.placeholders.location")}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                        getFieldStatus("location") === "error"
                          ? "border-red-500"
                          : getFieldStatus("location") === "success"
                            ? "border-green-500"
                            : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                      }`}
                    />
                    {touched.location && errors.location && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      {t("creatorRegister.fields.education")} *
                    </label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("education", e.target.value)
                      }
                      onBlur={() => handleBlur("education")}
                      placeholder={t("creatorRegister.placeholders.education")}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                        getFieldStatus("education") === "error"
                          ? "border-red-500"
                          : getFieldStatus("education") === "success"
                            ? "border-green-500"
                            : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                      }`}
                    />
                    {touched.education && errors.education && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.education}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-[#7C3AED]" />
                  {t("creatorRegister.sections.portfolio")}
                </h2>

                <div className="space-y-4">
                  {portfolio.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {portfolio.map((item) => (
                        <div key={item.id} className="relative group">
                          <Image
                            src={item.preview}
                            alt="Portfolio"
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePortfolioItem(item.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {t("creatorRegister.portfolio.uploadPrompt")}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePortfolioFileUpload}
                      className="hidden"
                      id="portfolio-upload"
                    />
                    <label
                      htmlFor="portfolio-upload"
                      className="inline-block px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] cursor-pointer transition-colors"
                    >
                      {t("creatorRegister.portfolio.selectImage")}
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-8 border border-purple-200">
                <h2 className="text-2xl font-bold text-[#7C3AED] mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  {t("creatorRegister.sections.experience")}
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                    {t("creatorRegister.fields.experienceDescription")} *
                  </label>
                  <textarea
                    value={formData.experienceDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleFieldChange("experienceDescription", e.target.value)
                    }
                    onBlur={() => handleBlur("experienceDescription")}
                    placeholder={t("creatorRegister.placeholders.experienceDescription")}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg outline-none transition-all resize-none ${
                      getFieldStatus("experienceDescription") === "error"
                        ? "border-red-500"
                        : getFieldStatus("experienceDescription") === "success"
                          ? "border-green-500"
                          : "border-gray-300 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                    }`}
                  />
                  {touched.experienceDescription && errors.experienceDescription && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.experienceDescription}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {t("creatorRegister.fields.experienceHint")}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-2 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-[#7C3AED]" />
                  {t("creatorRegister.sections.pricing")}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {t("creatorRegister.pricing.currencyNote")}
                </p>

                <div className="space-y-4">
                  {pricingList.map((pricing, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">
                          {t("creatorRegister.pricing.itemLabel", { number: index + 1 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePricing(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        <select
                          value={pricing.platform}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            handlePricingChange(index, "platform", e.target.value)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200 outline-none bg-white"
                        >
                          <option value="">
                            {t("creatorRegister.pricing.selectPlatform")}
                          </option>
                          <option value="TikTok">TikTok</option>
                          <option value="Instagram">Instagram</option>
                          <option value="YouTube">YouTube</option>
                        </select>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">
                            {t("creatorRegister.pricing.perPost")}
                          </label>
                          <input
                            type="number"
                            value={pricing.perPost}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handlePricingChange(index, "perPost", e.target.value)
                            }
                            placeholder="$ 0"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">
                            {t("creatorRegister.pricing.perStory")}
                          </label>
                          <input
                            type="number"
                            value={pricing.perStory}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handlePricingChange(index, "perStory", e.target.value)
                            }
                            placeholder="$ 0"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">
                            {t("creatorRegister.pricing.perLive")}
                          </label>
                          <input
                            type="number"
                            value={pricing.perLive}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handlePricingChange(index, "perLive", e.target.value)
                            }
                            placeholder="$ 0"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddPricing}
                    className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-[#7C3AED] font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t("creatorRegister.pricing.addBtn")}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className={`flex-1 py-5 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
                    isFormValid() && !isLoading
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#6D28D9] hover:to-[#9333EA] hover:shadow-2xl hover:scale-105"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t("creatorRegister.submit.saving")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      {isEditMode
                        ? t("creatorRegister.submit.update")
                        : t("creatorRegister.submit.create")}
                    </>
                  )}
                </button>
              </div>

              {!isFormValid() && (
                <div className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-2xl p-6 flex items-start gap-4 shadow-xl">
                  <AlertCircle className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-lg mb-3">
                      {t("creatorRegister.incomplete.title")}
                    </p>
                    <ul className="text-sm text-white/90 space-y-2">
                      {!avatarPreview && (
                        <li className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                          <XCircle className="w-4 h-4" />
                          {t("creatorRegister.incomplete.avatar")}
                        </li>
                      )}
                      {socialPlatforms.length === 0 && (
                        <li className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                          <XCircle className="w-4 h-4" />
                          {t("creatorRegister.incomplete.social")}
                        </li>
                      )}
                      {pricingList.length === 0 && (
                        <li className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                          <XCircle className="w-4 h-4" />
                          {t("creatorRegister.incomplete.pricing")}
                        </li>
                      )}
                      {portfolio.length === 0 && (
                        <li className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                          <XCircle className="w-4 h-4" />
                          {t("creatorRegister.incomplete.portfolio")}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
                {isEditMode
                  ? t("creatorRegister.success.titleEdit")
                  : t("creatorRegister.success.titleCreate")}
              </h2>
              <p className="text-gray-600 mb-6">
                {isEditMode
                  ? t("creatorRegister.success.subtitleEdit")
                  : t("creatorRegister.success.subtitleCreate")}
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}