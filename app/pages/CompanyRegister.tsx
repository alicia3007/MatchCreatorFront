"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import type { Company } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Mail,
  Lock,
  AlertCircle,
  FileText,
  Edit,
  Briefcase,
  DollarSign,
  Target,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { authService, companiesService } from "../api";

export default function CompanyRegister() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userType, currentUser, setUserType, setCurrentUser } = useUser();

  const isEditMode = userType === "company" && !!currentUser;
  const existingCompany = isEditMode ? (currentUser as Company) : null;

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    sector: "",
    budget: "",
    companyDescription: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    if (existingCompany) {
      setFormData({
        name: existingCompany.name ?? "",
        email: existingCompany.email ?? "",
        password: "",
        confirmPassword: "",
        sector: existingCompany.sector ?? "",
        budget: existingCompany.budget ?? "",
        companyDescription:
          existingCompany.objectives[0] ??
          existingCompany.description ??
          "",
      });
      setLogoPreview(existingCompany.logo ?? "");
    }
  }, [existingCompany]);

  const validateField = useCallback(
    (name: string, value: string): string => {
      let error = "";

      switch (name) {
        case "name":
          if (!value.trim()) {
            error = t("companyRegister.validation.nameRequired");
          } else if (value.trim().length < 3) {
            error = t("companyRegister.validation.nameMin");
          }
          break;

        case "email":
          if (!value.trim()) {
            error = t("companyRegister.validation.emailRequired");
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = t("errors.invalidEmail");
          }
          break;

        case "password":
          if (!isEditMode) {
            if (!value) {
              error = t("companyRegister.validation.passwordRequired");
            } else if (value.length < 6) {
              error = t("companyRegister.validation.passwordMin");
            }
          } else if (value && value.length < 6) {
            error = t("companyRegister.validation.passwordMin");
          }
          break;

        case "confirmPassword":
          if (!isEditMode) {
            if (!value) {
              error = t("companyRegister.validation.confirmPasswordRequired");
            } else if (value !== formData.password) {
              error = t("errors.passwordMismatch");
            }
          } else if (formData.password && value !== formData.password) {
            error = t("errors.passwordMismatch");
          }
          break;

        case "sector":
          if (!value) {
            error = t("companyRegister.validation.sectorRequired");
          }
          break;

        case "budget":
          if (!value) {
            error = t("companyRegister.validation.budgetRequired");
          }
          break;

        case "companyDescription":
          if (!value.trim()) {
            error = t("companyRegister.validation.descriptionRequired");
          } else if (value.trim().length < 20) {
            error = t("companyRegister.validation.descriptionMin");
          }
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
    const error = validateField(
      name,
      formData[name as keyof typeof formData],
    );
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(
        key,
        formData[key as keyof typeof formData],
      );
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      sector: true,
      budget: true,
      companyDescription: true,
    });

    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      if (isEditMode && existingCompany) {
        const updatedCompanyData: Partial<Company> = {
          name: formData.name,
          email: formData.email,
          logo: logoPreview || existingCompany.logo,
          sector: formData.sector,
          description: formData.companyDescription,
          budget: formData.budget,
          objectives: [formData.companyDescription],
        };

        const updatedCompany = await companiesService.update(
          existingCompany.id,
          updatedCompanyData,
        );

        setCurrentUser(updatedCompany);
        setShowSuccess(true);

        setTimeout(() => {
          router.push("/company/profile");
        }, 2000);
      } else {
        const companyData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          logo: logoPreview || "",  // ✅ FIX: logo ahora se envía al backend
          sector: formData.sector,
          description: formData.companyDescription,
          budget: formData.budget,
          objectives: [formData.companyDescription],
        };

        const response = await authService.registerCompany(companyData);

        setUserType(response.userType);
        setCurrentUser(response.profile);
        setShowSuccess(true);

        setTimeout(() => {
          router.push("/company/profile");
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Error al guardar empresa:", error);

      const apiError = error as {
        response?: { data?: { message?: string } };
      };

      setErrors((prev) => ({
        ...prev,
        submit:
          apiError.response?.data?.message ??
          "Error al guardar la información",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    if (isEditMode && existingCompany) {
      setFormData({
        name: existingCompany.name ?? "",
        email: existingCompany.email ?? "",
        password: "",
        confirmPassword: "",
        sector: existingCompany.sector ?? "",
        budget: existingCompany.budget ?? "",
        companyDescription:
          existingCompany.objectives[0] ??
          existingCompany.description ??
          "",
      });
      setLogoPreview(existingCompany.logo ?? "");
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        sector: "",
        budget: "",
        companyDescription: "",
      });
      setLogoPreview("");
    }

    setErrors({});
    setTouched({});
    setLogoFile(null);
  };

  const getFieldStatus = (name: string) => {
    if (!touched[name]) return "default";
    if (errors[name]) return "error";
    if (formData[name as keyof typeof formData]) return "success";
    return "default";
  };

  // Silencia el warning de logoFile no usado — se usaría en upload real
  void logoFile;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <main className="w-full">
        <header className="px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-[#E5E7EB]">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <button
              onClick={() =>
                router.push(isEditMode ? "/company/profile" : "/")
              }
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {isEditMode
                ? t("companyRegister.header.backToProfile")
                : t("common.back")}
            </button>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="h-14 w-auto flex items-center">
                <span className="font-black text-[#38BDF8] text-xl">
                  MatchCreator
                </span>
              </div>
            </div>

            <div className="w-32">
              {!isEditMode && (
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2 text-gray-700 hover:text-[#0EA5E9] font-medium transition-colors"
                >
                  {t("companyRegister.header.alreadyHaveAccount")}
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="px-6 py-8 max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
              {isEditMode
                ? t("companyRegister.title.edit")
                : t("companyRegister.title.create")}
            </h1>
            <p className="text-gray-600">
              {isEditMode
                ? t("companyRegister.subtitle.edit")
                : t("companyRegister.subtitle.create")}
            </p>
          </div>

          <div className="mb-8 bg-[#F9FAFB] rounded-lg p-6 border border-[#E5E7EB]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#0EA5E9]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F2937] mb-2">
                  {isEditMode
                    ? t("companyRegister.infoBlock.edit.title")
                    : t("companyRegister.infoBlock.create.title")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {isEditMode
                        ? t("companyRegister.infoBlock.edit.check1")
                        : t("companyRegister.infoBlock.create.check1")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {isEditMode
                        ? t("companyRegister.infoBlock.edit.check2")
                        : t("companyRegister.infoBlock.create.check2")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {isEditMode
                        ? t("companyRegister.infoBlock.edit.check3")
                        : t("companyRegister.infoBlock.create.check3")}
                    </span>
                  </li>
                  {!isEditMode && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        {t("companyRegister.infoBlock.create.check4")}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {!showSuccess ? (
                <form
                  onSubmit={(e) => void handleSubmit(e)}
                  className="bg-white rounded-lg shadow-sm p-8 border border-[#E5E7EB]"
                >
                  <h2 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
                    {isEditMode ? (
                      <Edit className="w-6 h-6 text-[#0EA5E9]" />
                    ) : (
                      <FileText className="w-6 h-6 text-[#0EA5E9]" />
                    )}
                    {isEditMode
                      ? t("companyRegister.form.titleEdit")
                      : t("companyRegister.form.titleCreate")}
                  </h2>

                  {/* Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("companyRegister.fields.name")} *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Building2
                          className={`w-5 h-5 ${
                            getFieldStatus("name") === "error"
                              ? "text-red-500"
                              : getFieldStatus("name") === "success"
                                ? "text-green-500"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                        onBlur={() => handleBlur("name")}
                        placeholder={t("companyRegister.placeholders.name")}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg outline-none transition-all ${
                          getFieldStatus("name") === "error"
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : getFieldStatus("name") === "success"
                              ? "border-green-500 focus:ring-2 focus:ring-green-200"
                              : "border-[#E5E7EB] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                        }`}
                      />
                      {getFieldStatus("name") === "success" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {touched.name && errors.name && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                    {!errors.name && touched.name && formData.name && (
                      <p className="text-xs text-green-600 mt-1">
                        {t("companyRegister.fieldValid.name")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t("companyRegister.hints.name")}
                    </p>
                  </div>

                  {/* Logo */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("companyRegister.fields.logo")}
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({t("companyRegister.fields.logoOptional")})
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center hover:border-[#0EA5E9] transition-colors">
                      {logoPreview ? (
                        <div className="space-y-3">
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview("");
                            }}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            {t("companyRegister.logo.remove")}
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            {t("companyRegister.logo.uploadPrompt")}
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-block px-4 py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:bg-[#0EA5E9]/90 cursor-pointer transition-colors"
                          >
                            {t("companyRegister.logo.selectFile")}
                          </label>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("companyRegister.logo.formatHint")}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("companyRegister.fields.email")} *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Mail
                          className={`w-5 h-5 ${
                            getFieldStatus("email") === "error"
                              ? "text-red-500"
                              : getFieldStatus("email") === "success"
                                ? "text-green-500"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        onBlur={() => handleBlur("email")}
                        placeholder={t("companyRegister.placeholders.email")}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg outline-none transition-all ${
                          getFieldStatus("email") === "error"
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : getFieldStatus("email") === "success"
                              ? "border-green-500 focus:ring-2 focus:ring-green-200"
                              : "border-[#E5E7EB] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                        }`}
                      />
                      {getFieldStatus("email") === "success" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                    {!errors.email && touched.email && formData.email && (
                      <p className="text-xs text-green-600 mt-1">
                        {t("companyRegister.fieldValid.email")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t("companyRegister.hints.email")}
                    </p>
                  </div>

                  {/* Password — solo en create */}
                  {!isEditMode && (
                    <>
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                          {t("companyRegister.fields.password")} *
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Lock
                              className={`w-5 h-5 ${
                                getFieldStatus("password") === "error"
                                  ? "text-red-500"
                                  : getFieldStatus("password") === "success"
                                    ? "text-green-500"
                                    : "text-gray-400"
                              }`}
                            />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              handleFieldChange("password", e.target.value)
                            }
                            onBlur={() => handleBlur("password")}
                            placeholder={t("companyRegister.placeholders.password")}
                            className={`w-full pl-11 pr-11 py-3 border rounded-lg outline-none transition-all ${
                              getFieldStatus("password") === "error"
                                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                                : getFieldStatus("password") === "success"
                                  ? "border-green-500 focus:ring-2 focus:ring-green-200"
                                  : "border-[#E5E7EB] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
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
                        {!errors.password && touched.password && formData.password && (
                          <p className="text-xs text-green-600 mt-1">
                            {t("companyRegister.fieldValid.password")}
                          </p>
                        )}
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                          {t("companyRegister.fields.confirmPassword")} *
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Lock
                              className={`w-5 h-5 ${
                                getFieldStatus("confirmPassword") === "error"
                                  ? "text-red-500"
                                  : getFieldStatus("confirmPassword") === "success"
                                    ? "text-green-500"
                                    : "text-gray-400"
                              }`}
                            />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleFieldChange("confirmPassword", e.target.value)
                            }
                            onBlur={() => handleBlur("confirmPassword")}
                            placeholder={t("companyRegister.placeholders.confirmPassword")}
                            className={`w-full pl-11 pr-11 py-3 border rounded-lg outline-none transition-all ${
                              getFieldStatus("confirmPassword") === "error"
                                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                                : getFieldStatus("confirmPassword") === "success"
                                  ? "border-green-500 focus:ring-2 focus:ring-green-200"
                                  : "border-[#E5E7EB] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
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
                        {!errors.confirmPassword && touched.confirmPassword && formData.confirmPassword && (
                          <p className="text-xs text-green-600 mt-1">
                            {t("companyRegister.fieldValid.confirmPassword")}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Sector */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("companyRegister.fields.sector")} *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Briefcase
                          className={`w-5 h-5 ${
                            getFieldStatus("sector") === "error"
                              ? "text-red-500"
                              : getFieldStatus("sector") === "success"
                                ? "text-green-500"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <select
                        value={formData.sector}
                        onChange={(e) =>
                          handleFieldChange("sector", e.target.value)
                        }
                        onBlur={() => handleBlur("sector")}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg outline-none transition-all ${
                          getFieldStatus("sector") === "error"
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : getFieldStatus("sector") === "success"
                              ? "border-green-500 focus:ring-2 focus:ring-green-200"
                              : "border-[#E5E7EB] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                        }`}
                      >
                        <option value="">
                          {t("companyRegister.placeholders.sector")}
                        </option>
                        {[
                          "technology",
                          "fashion",
                          "foodBeverage",
                          "healthWellness",
                          "education",
                          "entertainment",
                          "beauty",
                          "sports",
                          "travel",
                          "finance",
                          "other",
                        ].map((key) => (
                          <option
                            key={key}
                            value={t(`companyRegister.sectors.${key}`)}
                          >
                            {t(`companyRegister.sectors.${key}`)}
                          </option>
                        ))}
                      </select>
                      {getFieldStatus("sector") === "success" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {touched.sector && errors.sector && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.sector}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t("companyRegister.hints.sector")}
                    </p>
                  </div>

                  {/* Budget */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("companyRegister.fields.budget")} *
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title={t("companyRegister.hints.budgetTooltip")}
                      >
                        <HelpCircle className="w-4 h-4 inline" />
                      </button>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <DollarSign
                          className={`w-5 h-5 ${
                            getFieldStatus("budget") === "error"
                              ? "text-red-500"
                              : getFieldStatus("budget") === "success"
                                ? "text-green-500"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                      <select
                        value={formData.budget}
                        onChange={(e) =>
                          handleFieldChange("budget", e.target.value)
                        }
                        onBlur={() => handleBlur("budget")}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg outline-none transition-all ${
                          getFieldStatus("budget") === "error"
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : getFieldStatus("budget") === "success"
                              ? "border-green-500 focus:ring-2 focus:ring-green-200"
                              : "border-[#E5E7EB] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                        }`}
                      >
                        <option value="">
                          {t("companyRegister.placeholders.budget")}
                        </option>
                        <option value="$500 - $1,000">$500 - $1,000</option>
                        <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                        <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000+">$10,000+</option>
                      </select>
                      {getFieldStatus("budget") === "success" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {touched.budget && errors.budget && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.budget}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t("companyRegister.hints.budget")}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      {t("companyRegister.fields.description")} *
                    </label>
                    <textarea
                      value={formData.companyDescription}
                      onChange={(e) =>
                        handleFieldChange("companyDescription", e.target.value)
                      }
                      onBlur={() => handleBlur("companyDescription")}
                      placeholder={t("companyRegister.placeholders.description")}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-all resize-none ${
                        getFieldStatus("companyDescription") === "error"
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : getFieldStatus("companyDescription") === "success"
                            ? "border-green-500 focus:ring-2 focus:ring-green-200"
                            : "border-[#E5E7EB] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        {touched.companyDescription && errors.companyDescription && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {errors.companyDescription}
                          </p>
                        )}
                        {!errors.companyDescription &&
                          touched.companyDescription &&
                          formData.companyDescription && (
                            <p className="text-xs text-green-600">
                              {t("companyRegister.fieldValid.description")}
                            </p>
                          )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formData.companyDescription.length}/200
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("companyRegister.hints.description")}
                    </p>
                  </div>

                  {errors.submit && (
                    <p className="text-sm text-red-500 mb-4 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {errors.submit}
                    </p>
                  )}

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isEditMode
                            ? t("companyRegister.submit.saving")
                            : t("companyRegister.submit.creating")}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {isEditMode
                            ? t("companyRegister.submit.saveChanges")
                            : t("companyRegister.submit.create")}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="w-full py-3 border-2 border-[#E5E7EB] text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                      {isEditMode
                        ? t("companyRegister.submit.undoChanges")
                        : t("companyRegister.submit.clearForm")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 border border-[#E5E7EB]">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1F2937] mb-2">
                      {isEditMode
                        ? t("companyRegister.success.titleEdit")
                        : t("companyRegister.success.titleCreate")}
                    </h2>
                    <p className="text-gray-600">
                      {isEditMode
                        ? t("companyRegister.success.subtitleEdit")
                        : t("companyRegister.success.subtitleCreate")}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800">
                      ✓{" "}
                      {isEditMode
                        ? t("companyRegister.success.check1Edit")
                        : t("companyRegister.success.check1Create")}
                      <br />✓{" "}
                      {isEditMode
                        ? t("companyRegister.success.check2Edit")
                        : t("companyRegister.success.check2Create")}
                      <br />✓{" "}
                      {isEditMode
                        ? t("companyRegister.success.check3Edit")
                        : t("companyRegister.success.check3Create")}
                    </p>
                  </div>

                  <p className="text-center text-sm text-gray-600">
                    {t("companyRegister.success.redirecting")}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {formData.name && formData.sector && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E5E7EB]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1F2937]">
                      {t("companyRegister.preview.title")}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    {t("companyRegister.preview.subtitle")}
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] rounded-lg flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Logo"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-10 h-10 text-white" />
                        )}
                      </div>
                    </div>

                    <div className="text-center border-t border-[#E5E7EB] pt-4">
                      <h4 className="font-bold text-[#1F2937] text-lg mb-1">
                        {formData.name || t("companyRegister.preview.namePlaceholder")}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {formData.sector || t("companyRegister.preview.sectorPlaceholder")}
                      </p>

                      <div className="space-y-2 text-left">
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-[#0EA5E9] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">
                              {t("companyRegister.preview.budgetLabel")}
                            </p>
                            <p className="text-sm font-medium text-[#1F2937]">
                              {formData.budget || t("companyRegister.preview.budgetEmpty")}
                            </p>
                          </div>
                        </div>

                        {formData.companyDescription && (
                          <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-[#0EA5E9] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">
                                {t("companyRegister.preview.objectiveLabel")}
                              </p>
                              <p className="text-sm text-[#1F2937] line-clamp-3">
                                {formData.companyDescription}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <HelpCircle className="w-6 h-6 text-[#0EA5E9] flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[#1F2937] mb-2">
                      {t("companyRegister.help.title")}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {t("companyRegister.help.subtitle")}
                    </p>
                    <a
                      href="#"
                      className="text-sm text-[#0EA5E9] hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      {t("companyRegister.help.guideLink")}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E5E7EB]">
                <h3 className="font-semibold text-[#1F2937] mb-3">
                  {t("companyRegister.tips.title")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("companyRegister.tips.tip1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("companyRegister.tips.tip2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("companyRegister.tips.tip3")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#0EA5E9]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1F2937] text-lg mb-2">
                  {isEditMode
                    ? t("companyRegister.modal.titleEdit")
                    : t("companyRegister.modal.titleCreate")}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? t("companyRegister.modal.subtitleEdit")
                    : t("companyRegister.modal.subtitleCreate")}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border-2 border-[#E5E7EB] text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => void handleConfirmSubmit()}
                className="flex-1 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}