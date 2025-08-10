import { db } from '../db.js';
import { invites } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import { generateInviteCode } from '../utils/invite-code.js';
class InviteService {
    async createInviteWithAssignment(data) {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return {
                    success: false,
                    error: 'Invalid email format'
                };
            }
            const inviteCode = generateInviteCode().replace(/-/g, '');
            if (inviteCode.length > 12) {
                throw new Error('Generated invite code exceeds database limit');
            }
            const result = await db.execute(sql `
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id, is_beta_tester)
        VALUES (${inviteCode}, ${data.email.toLowerCase()}, ${data.role}, ${data.name || null}, ${data.createdBy}, ${data.expiresAt || null}, ${data.cohortId || null}, ${data.organizationId || null}, ${data.isBetaTester || false})
        RETURNING *
      `);
            const inviteData = result[0] || result.rows?.[0] || {
                invite_code: inviteCode,
                email: data.email.toLowerCase(),
                role: data.role,
                name: data.name || null,
                created_by: data.createdBy,
                expires_at: data.expiresAt || null,
                cohort_id: data.cohortId || null,
                organization_id: data.organizationId || null,
                is_beta_tester: data.isBetaTester || false,
                created_at: new Date(),
                used_at: null,
                used_by: null
            };
            return {
                success: true,
                invite: {
                    ...inviteData,
                    formattedCode: this.formatInviteCode(inviteCode)
                }
            };
        }
        catch (error) {
            console.error('Error creating invite:', error);
            return {
                success: false,
                error: 'Failed to create invite'
            };
        }
    }
    async createInvite(data) {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return {
                    success: false,
                    error: 'Invalid email format'
                };
            }
            const inviteCode = generateInviteCode().replace(/-/g, '');
            if (inviteCode.length > 12) {
                throw new Error('Generated invite code exceeds database limit');
            }
            const result = await db.execute(sql `
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id, is_beta_tester)
        VALUES (${inviteCode}, ${data.email.toLowerCase()}, ${data.role}, ${data.name || null}, ${data.createdBy}, ${data.expiresAt || null}, ${data.cohortId ? parseInt(data.cohortId) : null}, ${data.organizationId || null}, ${data.isBetaTester || false})
        RETURNING *
      `);
            const inviteData = result[0] || result.rows?.[0] || {
                invite_code: inviteCode,
                email: data.email.toLowerCase(),
                role: data.role,
                name: data.name || null,
                created_by: data.createdBy,
                expires_at: data.expiresAt || null,
                is_beta_tester: data.isBetaTester || false,
                created_at: new Date(),
                used_at: null,
                used_by: null
            };
            return {
                success: true,
                invite: inviteData
            };
        }
        catch (error) {
            console.error('Error creating invite:', error);
            return {
                success: false,
                error: 'Failed to create invite'
            };
        }
    }
    async getInviteByCode(inviteCode) {
        try {
            const result = await db.select()
                .from(invites)
                .where(eq(invites.inviteCode, inviteCode));
            if (!result || result.length === 0) {
                return {
                    success: false,
                    error: 'Invite not found'
                };
            }
            return {
                success: true,
                invite: result[0]
            };
        }
        catch (error) {
            console.error('Error fetching invite:', error);
            return {
                success: false,
                error: 'Failed to fetch invite'
            };
        }
    }
    async markInviteAsUsed(inviteCode, userId) {
        try {
            const result = await db.execute(sql `
        UPDATE invites 
        SET used_at = NOW(), used_by = ${userId}
        WHERE invite_code = ${inviteCode}
        RETURNING *
      `);
            const inviteData = result[0] || result.rows?.[0];
            return {
                success: true,
                invite: inviteData
            };
        }
        catch (error) {
            console.error('Error marking invite as used:', error);
            return {
                success: false,
                error: 'Failed to mark invite as used'
            };
        }
    }
    async getInvitesByCreator(creatorId) {
        try {
            const result = await db.select()
                .from(invites)
                .where(eq(invites.createdBy, creatorId));
            return {
                success: true,
                invites: result
            };
        }
        catch (error) {
            console.error('Error fetching invites by creator:', error);
            return {
                success: false,
                error: 'Failed to fetch invites'
            };
        }
    }
    async getInvitesWithDetails(creatorId) {
        try {
            let query = sql `
        SELECT 
          i.*,
          creator.name as creator_name,
          creator.email as creator_email,
          creator.role as creator_role,
          c.name as cohort_name,
          o.name as organization_name,
          invited_user.is_test_user,
          invited_user.is_beta_tester as user_is_beta_tester
        FROM invites i
        LEFT JOIN users creator ON i.created_by = creator.id
        LEFT JOIN cohorts c ON i.cohort_id = c.id
        LEFT JOIN organizations o ON i.organization_id = o.id
        LEFT JOIN users invited_user ON i.email = invited_user.email
      `;
            if (creatorId) {
                query = sql `
          SELECT 
            i.*,
            creator.name as creator_name,
            creator.email as creator_email,
            creator.role as creator_role,
            c.name as cohort_name,
            o.name as organization_name,
            invited_user.is_test_user,
            invited_user.is_beta_tester as user_is_beta_tester
          FROM invites i
          LEFT JOIN users creator ON i.created_by = creator.id
          LEFT JOIN cohorts c ON i.cohort_id = c.id
          LEFT JOIN organizations o ON i.organization_id = o.id
          LEFT JOIN users invited_user ON i.email = invited_user.email
          WHERE i.created_by = ${creatorId}
        `;
            }
            query = sql `${query} ORDER BY i.created_at DESC`;
            const result = await db.execute(query);
            const invitesData = result || result.rows || [];
            return {
                success: true,
                invites: invitesData.map((invite) => ({
                    ...invite,
                    formattedCode: this.formatInviteCode(invite.invite_code)
                }))
            };
        }
        catch (error) {
            console.error('Error fetching invites with details:', error);
            return {
                success: false,
                error: 'Failed to fetch invites'
            };
        }
    }
    async getAllInvites() {
        try {
            const result = await db.execute(sql `
        SELECT 
          i.*,
          creator.name as creator_name,
          creator.email as creator_email,
          creator.role as creator_role,
          c.name as cohort_name,
          o.name as organization_name,
          invited_user.is_test_user,
          invited_user.is_beta_tester as user_is_beta_tester
        FROM invites i
        LEFT JOIN users creator ON i.created_by = creator.id
        LEFT JOIN cohorts c ON i.cohort_id = c.id
        LEFT JOIN organizations o ON i.organization_id = o.id
        LEFT JOIN users invited_user ON i.email = invited_user.email
        ORDER BY i.created_at DESC
      `);
            return {
                success: true,
                invites: result
            };
        }
        catch (error) {
            console.error('Error fetching all invites:', error);
            return {
                success: false,
                error: 'Failed to fetch invites'
            };
        }
    }
    async getInvitesByCreatorWithInfo(creatorId) {
        try {
            const result = await db.execute(sql `
        SELECT 
          i.*,
          u.name as creator_name,
          u.email as creator_email,
          u.role as creator_role
        FROM invites i
        LEFT JOIN users u ON i.created_by = u.id
        WHERE i.created_by = ${creatorId}
        ORDER BY i.created_at DESC
      `);
            return {
                success: true,
                invites: result
            };
        }
        catch (error) {
            console.error('Error fetching invites by creator:', error);
            return {
                success: false,
                error: 'Failed to fetch invites'
            };
        }
    }
    async deleteInvite(id) {
        try {
            const result = await db.execute(sql `
        DELETE FROM invites WHERE id = ${id}
        RETURNING *
      `);
            const inviteData = result[0] || result.rows?.[0];
            return {
                success: true,
                deletedInvite: inviteData
            };
        }
        catch (error) {
            console.error('Error deleting invite:', error);
            return {
                success: false,
                error: 'Failed to delete invite'
            };
        }
    }
    formatInviteCode(code) {
        if (!code)
            return '';
        return code.replace(/(.{4})/g, '$1-').replace(/-$/, '');
    }
}
export const inviteService = new InviteService();
