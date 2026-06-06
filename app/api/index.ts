// Exportar todos los servicios desde un solo archivo
export { apiClient } from './client';
export { authService } from './auth.service';
export { creatorsService } from './creators.service';
export { companiesService } from './companies.service';
export { campaignsService } from './campaigns.service';
export { applicationsService } from './applications.service';
export { messagesService } from './messages.service';
export { notificationsService } from './notifications.service';
export { recommendationsService } from './recommendations.service';
export type { CreatorRecommendation, CampaignRecommendation } from './recommendations.service';