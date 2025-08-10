import { photoStorageService } from '../services/photo-storage-service';
export function convertUserToPhotoReference(user) {
    const result = {
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
    if (result.profilePictureId) {
        result.profilePictureUrl = photoStorageService.getPhotoUrl(result.profilePictureId);
    }
    return result;
}
export async function processProfilePicture(profilePictureData, userId) {
    if (!profilePictureData) {
        return null;
    }
    if (typeof profilePictureData === 'number') {
        const metadata = await photoStorageService.getPhotoMetadata(profilePictureData);
        return metadata ? profilePictureData : null;
    }
    if (typeof profilePictureData === 'string') {
        const photoId = parseInt(profilePictureData);
        if (!isNaN(photoId)) {
            const metadata = await photoStorageService.getPhotoMetadata(photoId);
            return metadata ? photoId : null;
        }
        if (profilePictureData.startsWith('data:image')) {
            try {
                const photoId = await photoStorageService.storePhoto(profilePictureData, userId, true);
                return photoId;
            }
            catch (error) {
                console.error('Error storing profile picture:', error);
                return null;
            }
        }
    }
    return null;
}
export function sanitizeUserForNetwork(user) {
    const sanitized = { ...user };
    delete sanitized.profile_picture;
    delete sanitized.profilePicture;
    return sanitized;
}
