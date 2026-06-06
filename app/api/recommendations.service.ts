import { apiClient } from './client';

export interface CreatorRecommendation {
  creator: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    publicName: string;
    bio: string;
    contentType: string[];
    socialMedia: { platform: string; followers: number; url: string }[];
    experience: string;
    portfolio: string[];
    availability: string;
    rating: number;
  };
  score: number;
  reasons: string[];
}

export interface CampaignRecommendation {
  campaign: {
    id: string;
    name: string;
    description: string;
    companyId: string;
    companyName: string;
    objective: string;
    budget: string;
    startDate: string;
    endDate: string;
    creatorType: string[];
    socialPlatform: string[];
    requirements: string[];
    status: 'active' | 'closed';
    applicants: [];
    mainImage?: string;
    bannerImage?: string;
  };
  score: number;
  reasons: string[];
}

export const recommendationsService = {
  // POST /recommendations/creators — para empresas
  async getCreatorRecommendations(
    companyId: string,
    options?: { limit?: number; minFollowers?: number; platforms?: string[] },
  ): Promise<CreatorRecommendation[]> {
    const response = await apiClient.post<{ recommendations: CreatorRecommendation[] }>(
      '/recommendations/creators',
      {
        companyId,
        limit: options?.limit ?? 10,
        ...(options?.minFollowers !== undefined && { minFollowers: options.minFollowers }),
        ...(options?.platforms?.length && { platforms: options.platforms }),
      },
    );
    return response.data.recommendations;
  },

  // POST /recommendations/campaigns — para creadores
  async getCampaignRecommendations(
    creatorId: string,
    options?: { limit?: number },
  ): Promise<CampaignRecommendation[]> {
    const response = await apiClient.post<{ recommendations: CampaignRecommendation[] }>(
      '/recommendations/campaigns',
      {
        creatorId,
        limit: options?.limit ?? 10,
      },
    );
    return response.data.recommendations;
  },
};