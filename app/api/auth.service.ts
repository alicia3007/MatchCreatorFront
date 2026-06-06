import { apiClient } from "./client";
import type {
  Creator,
  Company,
} from "../context/UserContext";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "creator" | "company";
  profileId: string;
}

interface AuthResponse {
  access_token: string;
  user: AuthUser;
  profile: Creator | Company;
}

interface LoginResponse {
  user: AuthUser;
  profile: Creator | Company;
  userType: "creator" | "company";
  token: string;
}

interface RegisterCreatorData {
  name: string;
  email: string;
  password: string;
  publicName: string;
  bio: string;
  contentType: string[];
  socialMedia: {
    platform: string;
    followers: number;
    url: string;
  }[];
  experience: string;
  portfolio: string[];
  availability: string;
  age?: number;
  birthDate?: string;
  city?: string;
  education?: string;
  pricing?: {
    platform: string;
    perPost: number;
    perStory: number;
    perLive: number;
  }[];
}

interface RegisterCompanyData {
  name: string;
  email: string;
  password: string;
  sector: string;
  description: string;
  budget: string;
  objectives: string[];
}

// Adapta la respuesta del backend al formato que usa el frontend
function adaptAuthResponse(data: AuthResponse): LoginResponse {
  return {
    token: data.access_token,
    userType: data.user.role,
    user: data.user,
    profile: data.profile,
  };
}

export const authService = {
  // Login
  async login(
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/login",
      {
        email,
        password,
      },
    );

    const adapted = adaptAuthResponse(data);

    localStorage.setItem("token", adapted.token);
    localStorage.setItem("userType", adapted.userType);
    localStorage.setItem("currentUserId", adapted.user.id);
    localStorage.setItem("profileId", adapted.user.profileId);

    return adapted;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("currentUserId");
      localStorage.removeItem("profileId");
    }
  },

  // Obtener usuario actual autenticado
  async getMe(): Promise<LoginResponse> {
    const { data } =
      await apiClient.get<AuthResponse>("/auth/me");
    return adaptAuthResponse(data);
  },

  // Registrar creador
  async registerCreator(
    creatorData: RegisterCreatorData,
  ): Promise<LoginResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register/creator",
      creatorData,
    );

    const adapted = adaptAuthResponse(data);

    localStorage.setItem("token", adapted.token);
    localStorage.setItem("userType", adapted.userType);
    localStorage.setItem("currentUserId", adapted.user.id);
    localStorage.setItem("profileId", adapted.user.profileId);

    return adapted;
  },

  // Registrar empresa
  async registerCompany(
    companyData: RegisterCompanyData,
  ): Promise<LoginResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register/company",
      companyData,
    );

    const adapted = adaptAuthResponse(data);

    localStorage.setItem("token", adapted.token);
    localStorage.setItem("userType", adapted.userType);
    localStorage.setItem("currentUserId", adapted.user.id);
    localStorage.setItem("profileId", adapted.user.profileId);

    return adapted;
  },
};