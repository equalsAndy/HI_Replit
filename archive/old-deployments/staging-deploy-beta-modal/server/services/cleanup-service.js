import { db } from '../db.js';
import { workshopStepData } from '../../shared/schema.js';
import { and, isNotNull, lt } from 'drizzle-orm';
export class CleanupService {
    static async cleanupOldDeletedWorkshopData(monthsOld = 6) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);
            console.log(`Starting cleanup of workshop data deleted before ${cutoffDate.toISOString()}`);
            const result = await db.delete(workshopStepData)
                .where(and(isNotNull(workshopStepData.deletedAt), lt(workshopStepData.deletedAt, cutoffDate)));
            const deletedCount = Array.isArray(result) ? result.length : result.changes || 0;
            console.log(`Cleanup completed: permanently deleted ${deletedCount} old workshop records`);
            return {
                success: true,
                deletedCount
            };
        }
        catch (error) {
            console.error('Error during workshop data cleanup:', error);
            return {
                success: false,
                deletedCount: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getCleanupStats() {
        try {
            const softDeletedRecords = await db.select({
                deletedAt: workshopStepData.deletedAt
            })
                .from(workshopStepData)
                .where(isNotNull(workshopStepData.deletedAt));
            const deletedDates = softDeletedRecords
                .map(r => r.deletedAt)
                .filter((date) => date !== null)
                .sort((a, b) => a.getTime() - b.getTime());
            return {
                totalSoftDeleted: softDeletedRecords.length,
                oldestDeletedAt: deletedDates.length > 0 ? deletedDates[0] : null,
                newestDeletedAt: deletedDates.length > 0 ? deletedDates[deletedDates.length - 1] : null
            };
        }
        catch (error) {
            console.error('Error getting cleanup stats:', error);
            return {
                totalSoftDeleted: 0,
                oldestDeletedAt: null,
                newestDeletedAt: null
            };
        }
    }
}
