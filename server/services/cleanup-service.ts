import { db } from '../db.js';
import { workshopStepData } from '../../shared/schema.js';
import { and, isNotNull, lt } from 'drizzle-orm';

/**
 * Service for cleaning up old soft-deleted records
 */
export class CleanupService {
  /**
   * Delete soft-deleted workshop step data older than specified months
   * @param monthsOld - Number of months old to consider for cleanup (default: 6)
   * @returns Promise with cleanup result
   */
  public static async cleanupOldDeletedWorkshopData(monthsOld: number = 6): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);
      
      console.log(`Starting cleanup of workshop data deleted before ${cutoffDate.toISOString()}`);
      
      // Permanently delete soft-deleted records older than cutoff date
      const result = await db.delete(workshopStepData)
        .where(and(
          isNotNull(workshopStepData.deletedAt),
          lt(workshopStepData.deletedAt, cutoffDate)
        ));
      
      const deletedCount = Array.isArray(result) ? result.length : (result as any).changes || 0;
      
      console.log(`Cleanup completed: permanently deleted ${deletedCount} old workshop records`);
      
      return {
        success: true,
        deletedCount
      };
    } catch (error) {
      console.error('Error during workshop data cleanup:', error);
      return {
        success: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get statistics about soft-deleted data
   * @returns Promise with statistics
   */
  public static async getCleanupStats(): Promise<{
    totalSoftDeleted: number;
    oldestDeletedAt: Date | null;
    newestDeletedAt: Date | null;
  }> {
    try {
      const softDeletedRecords = await db.select({
        deletedAt: workshopStepData.deletedAt
      })
        .from(workshopStepData)
        .where(isNotNull(workshopStepData.deletedAt));
      
      const deletedDates = softDeletedRecords
        .map(r => r.deletedAt)
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());
      
      return {
        totalSoftDeleted: softDeletedRecords.length,
        oldestDeletedAt: deletedDates.length > 0 ? deletedDates[0] : null,
        newestDeletedAt: deletedDates.length > 0 ? deletedDates[deletedDates.length - 1] : null
      };
    } catch (error) {
      console.error('Error getting cleanup stats:', error);
      return {
        totalSoftDeleted: 0,
        oldestDeletedAt: null,
        newestDeletedAt: null
      };
    }
  }
}