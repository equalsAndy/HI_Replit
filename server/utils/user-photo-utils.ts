import { photoStorageService } from '../services/photo-storage-service';

/**
 * Utility functions for handling user photos in API responses
 * This prevents sending large base64 data in network responses
 */

export interface UserWithPhotoReference {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  jobTitle?: string;
  profilePictureId?: number;
  profilePictureUrl?: string;
  hasProfilePicture: boolean;
  isTestUser: boolean;
  isDemoAccount: boolean;
  isBetaTester: boolean;
  showDemoDataButtons: boolean;
  navigationProgress?: string;
  contentAccess: string;
  astAccess: boolean;
  iaAccess: boolean;
  astWorkshopCompleted: boolean;
  iaWorkshopCompleted: boolean;
  astCompletedAt?: Date;
  iaCompletedAt?: Date;
  assignedFacilitatorId?: number;
  cohortId?: number;
  teamId?: number;
  invitedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Converts a user object to include photo references instead of base64 data
 */
export function convertUserToPhotoReference(user: any): UserWithPhotoReference {
  const result: UserWithPhotoReference = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    jobTitle: user.job_title || user.jobTitle,
    profilePictureId: user.profile_picture_id || user.profilePictureId,
    hasProfilePicture: !!(user.profile_picture_id || user.profilePictureId || user.profile_picture || user.profilePicture),
    isTestUser: user.is_test_user || user.isTestUser || false,
    isDemoAccount: user.is_demo_account || user.isDemoAccount || false,
    isBetaTester: user.is_beta_tester || user.isBetaTester || false,
    showDemoDataButtons: user.show_demo_data_buttons || user.showDemoDataButtons || false,
    navigationProgress: user.navigation_progress || user.navigationProgress,
    contentAccess: user.content_access || user.contentAccess || 'professional',
    astAccess: user.ast_access || user.astAccess || true,
    iaAccess: user.ia_access || user.iaAccess || false,
    astWorkshopCompleted: user.ast_workshop_completed || user.astWorkshopCompleted || false,
    iaWorkshopCompleted: user.ia_workshop_completed || user.iaWorkshopCompleted || false,
    astCompletedAt: user.ast_completed_at || user.astCompletedAt,
    iaCompletedAt: user.ia_completed_at || user.iaCompletedAt,
    assignedFacilitatorId: user.assigned_facilitator_id || user.assignedFacilitatorId,
    cohortId: user.cohort_id || user.cohortId,
    teamId: user.team_id || user.teamId,
    invitedBy: user.invited_by || user.invitedBy,
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt
  };

  // Generate photo URL if photo reference exists
  if (result.profilePictureId) {
    result.profilePictureUrl = photoStorageService.getPhotoUrl(result.profilePictureId);
  }

  return result;
}

/**
 * Processes profile picture data for storage
 * If base64 data is provided, stores it and returns photo ID
 * If photo ID is provided, validates it and returns it
 */
export async function processProfilePicture(
  profilePictureData: string | number | null | undefined,
  userId: number
): Promise<number | null> {
  if (!profilePictureData) {
    return null;
  }

  // If it's already a photo ID (number), validate it exists
  if (typeof profilePictureData === 'number') {
    const metadata = await photoStorageService.getPhotoMetadata(profilePictureData);
    return metadata ? profilePictureData : null;
  }

  // If it's a string, check if it's base64 data or a photo ID
  if (typeof profilePictureData === 'string') {
    // Check if it's a numeric string (photo ID)
    const photoId = parseInt(profilePictureData);
    if (!isNaN(photoId)) {
      const metadata = await photoStorageService.getPhotoMetadata(photoId);
      return metadata ? photoId : null;
    }

    // Check if it's base64 image data
    if (profilePictureData.startsWith('data:image')) {
      try {
        const photoId = await photoStorageService.storePhoto(profilePictureData, userId, true);
        return photoId;
      } catch (error) {
        console.error('Error storing profile picture:', error);
        return null;
      }
    }
  }

  return null;
}

/**
 * Removes the legacy profile_picture field from user objects for network responses
 * This prevents accidentally sending base64 data
 */
export function sanitizeUserForNetwork(user: any): any {
  const sanitized = { ...user };
  
  // Remove legacy base64 fields
  delete sanitized.profile_picture;
  delete sanitized.profilePicture;
  
  return sanitized;
}