/**
 * Beta Tester Notes Service
 * =========================
 * Handles storage and retrieval of beta tester workshop feedback notes
 */

import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export interface BetaTesterNote {
  id?: number;
  userId: number;
  workshopType: 'ast' | 'ia';
  
  // Context information
  pageTitle: string;
  stepId?: string;
  moduleName?: string;
  questionContext?: string;
  urlPath?: string;
  
  // Note content
  noteContent: string;
  noteType?: 'general' | 'bug' | 'improvement' | 'question' | 'suggestion';
  
  // Technical context
  browserInfo?: any;
  systemInfo?: any;
  
  // Status
  isSubmitted?: boolean;
  isDeleted?: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date;
}

export interface BetaTesterNoteSummary {
  totalNotes: number;
  unsubmittedNotes: number;
  notesByType: Record<string, number>;
  notesByModule: Record<string, number>;
}

export class BetaTesterNotesService {
  
  /**
   * Create a new beta tester note
   */
  static async createNote(note: BetaTesterNote): Promise<number> {
    try {
      const result = await pool.query(
        `INSERT INTO beta_tester_notes (
          user_id, workshop_type, page_title, step_id, module_name, 
          question_context, url_path, note_content, note_type,
          browser_info, system_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          note.userId,
          note.workshopType,
          note.pageTitle,
          note.stepId || null,
          note.moduleName || null,
          note.questionContext || null,
          note.urlPath || null,
          note.noteContent,
          note.noteType || 'general',
          JSON.stringify(note.browserInfo) || null,
          JSON.stringify(note.systemInfo) || null
        ]
      );
      
      console.log(`✅ Created beta tester note ${result.rows[0].id} for user ${note.userId}`);
      return result.rows[0].id;
      
    } catch (error) {
      console.error('❌ Error creating beta tester note:', error);
      throw new Error('Failed to create beta tester note');
    }
  }
  
  /**
   * Get all notes for a user (unsubmitted only by default)
   */
  static async getUserNotes(
    userId: number, 
    workshopType?: 'ast' | 'ia',
    includeSubmitted: boolean = false
  ): Promise<BetaTesterNote[]> {
    try {
      let query = `
        SELECT 
          id, user_id, workshop_type, page_title, step_id, module_name,
          question_context, url_path, note_content, note_type,
          browser_info, system_info, is_submitted, is_deleted,
          created_at, updated_at, submitted_at
        FROM beta_tester_notes 
        WHERE user_id = $1 AND is_deleted = false
      `;
      
      const params: any[] = [userId];
      
      if (!includeSubmitted) {
        query += ` AND is_submitted = false`;
      }
      
      if (workshopType) {
        query += ` AND workshop_type = $${params.length + 1}`;
        params.push(workshopType);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        workshopType: row.workshop_type,
        pageTitle: row.page_title,
        stepId: row.step_id,
        moduleName: row.module_name,
        questionContext: row.question_context,
        urlPath: row.url_path,
        noteContent: row.note_content,
        noteType: row.note_type,
        browserInfo: row.browser_info,
        systemInfo: row.system_info,
        isSubmitted: row.is_submitted,
        isDeleted: row.is_deleted,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        submittedAt: row.submitted_at
      }));
      
    } catch (error) {
      console.error('❌ Error fetching user notes:', error);
      throw new Error('Failed to fetch beta tester notes');
    }
  }
  
  /**
   * Update note content only (for editing)
   */
  static async updateNote(noteId: number, userId: number, noteContent: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `UPDATE beta_tester_notes 
         SET note_content = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3 AND is_deleted = false`,
        [noteContent, noteId, userId]
      );
      
      return result.rowCount > 0;
      
    } catch (error) {
      console.error('❌ Error updating beta tester note:', error);
      throw new Error('Failed to update beta tester note');
    }
  }

  /**
   * Update a note with full options
   */
  static async updateNoteAdvanced(noteId: number, userId: number, updates: Partial<BetaTesterNote>): Promise<boolean> {
    try {
      const setClause = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      if (updates.noteContent !== undefined) {
        setClause.push(`note_content = $${paramIndex++}`);
        params.push(updates.noteContent);
      }
      
      if (updates.noteType !== undefined) {
        setClause.push(`note_type = $${paramIndex++}`);
        params.push(updates.noteType);
      }
      
      if (updates.isDeleted !== undefined) {
        setClause.push(`is_deleted = $${paramIndex++}`);
        params.push(updates.isDeleted);
      }
      
      if (setClause.length === 0) {
        return false;
      }
      
      params.push(noteId, userId);
      
      const result = await pool.query(
        `UPDATE beta_tester_notes 
         SET ${setClause.join(', ')}
         WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`,
        params
      );
      
      return result.rowCount > 0;
      
    } catch (error) {
      console.error('❌ Error updating beta tester note:', error);
      throw new Error('Failed to update beta tester note');
    }
  }
  
  /**
   * Submit all user notes
   */
  static async submitAllUserNotes(userId: number, workshopType?: 'ast' | 'ia'): Promise<number> {
    try {
      let query = `
        UPDATE beta_tester_notes 
        SET is_submitted = true, submitted_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_submitted = false AND is_deleted = false
      `;
      
      const params: any[] = [userId];
      
      if (workshopType) {
        query += ` AND workshop_type = $2`;
        params.push(workshopType);
      }
      
      const result = await pool.query(query, params);
      
      console.log(`✅ Submitted ${result.rowCount} notes for user ${userId}`);
      return result.rowCount;
      
    } catch (error) {
      console.error('❌ Error submitting notes:', error);
      throw new Error('Failed to submit beta tester notes');
    }
  }
  
  /**
   * Get notes summary for a user
   */
  static async getUserNotesSummary(userId: number, workshopType?: 'ast' | 'ia'): Promise<BetaTesterNoteSummary> {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_notes,
          COUNT(CASE WHEN is_submitted = false THEN 1 END) as unsubmitted_notes,
          note_type,
          module_name,
          COUNT(*) as type_count
        FROM beta_tester_notes 
        WHERE user_id = $1 AND is_deleted = false
      `;
      
      const params: any[] = [userId];
      
      if (workshopType) {
        query += ` AND workshop_type = $2`;
        params.push(workshopType);
      }
      
      query += ` GROUP BY note_type, module_name`;
      
      const result = await pool.query(query, params);
      
      const summary: BetaTesterNoteSummary = {
        totalNotes: 0,
        unsubmittedNotes: 0,
        notesByType: {},
        notesByModule: {}
      };
      
      result.rows.forEach(row => {
        if (summary.totalNotes === 0) {
          summary.totalNotes = parseInt(row.total_notes);
          summary.unsubmittedNotes = parseInt(row.unsubmitted_notes);
        }
        
        if (row.note_type) {
          summary.notesByType[row.note_type] = (summary.notesByType[row.note_type] || 0) + parseInt(row.type_count);
        }
        
        if (row.module_name) {
          summary.notesByModule[row.module_name] = (summary.notesByModule[row.module_name] || 0) + parseInt(row.type_count);
        }
      });
      
      return summary;
      
    } catch (error) {
      console.error('❌ Error fetching notes summary:', error);
      throw new Error('Failed to fetch notes summary');
    }
  }
  
  /**
   * Delete a note (soft delete)
   */
  static async deleteNote(noteId: number, userId: number): Promise<boolean> {
    return this.updateNoteAdvanced(noteId, userId, { isDeleted: true });
  }

  /**
   * Submit final beta feedback survey
   */
  static async submitFinalFeedback(feedbackData: any): Promise<number> {
    try {
      const result = await pool.query(
        `INSERT INTO beta_feedback_surveys (
          user_id, overall_quality, authenticity, recommendation,
          rose, bud, thorn, professional_application, improvements,
          interests, final_comments, submitted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
        [
          feedbackData.userId,
          feedbackData.overallQuality,
          feedbackData.authenticity,
          feedbackData.recommendation,
          feedbackData.rose || null,
          feedbackData.bud || null,
          feedbackData.thorn || null,
          feedbackData.professionalApplication || null,
          feedbackData.improvements || null,
          JSON.stringify(feedbackData.interests) || null,
          feedbackData.finalComments || null,
          feedbackData.submittedAt || new Date()
        ]
      );
      
      console.log(`✅ Created beta feedback survey ${result.rows[0].id} for user ${feedbackData.userId}`);
      return result.rows[0].id;
      
    } catch (error) {
      console.error('❌ Error submitting beta feedback:', error);
      throw new Error('Failed to submit beta feedback');
    }
  }

  /**
   * Check if user has already submitted feedback
   */
  static async checkFeedbackStatus(userId: number): Promise<{hasSubmittedFeedback: boolean, submittedAt?: Date}> {
    try {
      const result = await pool.query(
        `SELECT id, submitted_at 
         FROM beta_feedback_surveys 
         WHERE user_id = $1 
         ORDER BY submitted_at DESC 
         LIMIT 1`,
        [userId]
      );
      
      return {
        hasSubmittedFeedback: result.rows.length > 0,
        submittedAt: result.rows[0]?.submitted_at
      };
      
    } catch (error) {
      console.error('❌ Error checking feedback status:', error);
      throw new Error('Failed to check feedback status');
    }
  }
}