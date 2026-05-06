import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { isFacilitatorOrAdmin, isAdmin } from '../middleware/roles.js';
import { isFeatureEnabled } from '../utils/feature-flags.js';
import { emailTemplateService } from '../services/email-template-service.js';
import { emailVariableService } from '../services/email-variable-service.js';

const router = Router();

// Gate all routes behind the feature flag
router.use((_req: Request, res: Response, next) => {
  if (!isFeatureEnabled('emailInvitationSystem')) {
    return res.status(404).json({ success: false, message: 'Email invitation system is not enabled' });
  }
  next();
});

// ── Template Variables ────────────────────────────────────────────────────────

/** GET /api/email-templates/variables — list all template variables (for the picker UI) */
router.get('/variables', requireAuth, isFacilitatorOrAdmin, async (_req: Request, res: Response) => {
  try {
    const variables = await emailVariableService.getVariableDefinitions();
    res.json({ success: true, variables });
  } catch (error) {
    console.error('Error fetching template variables:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch template variables' });
  }
});

/** GET /api/email-templates/variables/sample — sample values for preview rendering */
router.get('/variables/sample', requireAuth, isFacilitatorOrAdmin, async (_req: Request, res: Response) => {
  try {
    const sample = await emailVariableService.getSampleVariables();
    res.json({ success: true, variables: sample });
  } catch (error) {
    console.error('Error fetching sample variables:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sample variables' });
  }
});

// ── Template CRUD ─────────────────────────────────────────────────────────────

/** GET /api/email-templates — list templates visible to current user */
router.get('/', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const role = (req.session as any).userRole;
    const templates = await emailTemplateService.getTemplatesForUser(userId, role);
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

/** GET /api/email-templates/:id — single template */
router.get('/:id', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }
    const template = await emailTemplateService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
});

/** POST /api/email-templates — create a new template */
router.post('/', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const role = (req.session as any).userRole;

    const { name, description, subject, htmlContent, plainTextContent, templateCategory, workshopType, isShared, isDefault, tags } = req.body;

    if (!name || !subject || !htmlContent) {
      return res.status(400).json({ success: false, message: 'name, subject, and htmlContent are required' });
    }

    // Only admins can create system or default templates
    const isSystemTemplate = role === 'admin' && req.body.isSystemTemplate === true;

    const template = await emailTemplateService.createTemplate({
      name,
      description,
      subject,
      htmlContent,
      plainTextContent,
      templateCategory,
      workshopType: workshopType || null,
      createdBy: userId,
      isSystemTemplate,
      isShared: role === 'admin' ? isShared : false,
      isDefault: role === 'admin' ? isDefault : false,
      tags,
    });

    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

/** PUT /api/email-templates/:id — update a template */
router.put('/:id', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const userId = (req.session as any).userId;
    const role = (req.session as any).userRole;

    const canEdit = await emailTemplateService.canUserEditTemplate(userId, id, role);
    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this template' });
    }

    const { name, description, subject, htmlContent, plainTextContent, templateCategory, workshopType, isShared, isActive, isDefault, tags } = req.body;

    const updated = await emailTemplateService.updateTemplate(id, {
      name,
      description,
      subject,
      htmlContent,
      plainTextContent,
      templateCategory,
      workshopType,
      isShared: role === 'admin' ? isShared : undefined,
      isActive,
      isDefault: role === 'admin' ? isDefault : undefined,
      tags,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, template: updated });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

/** DELETE /api/email-templates/:id — soft-delete a template */
router.delete('/:id', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const userId = (req.session as any).userId;
    const role = (req.session as any).userRole;

    const canEdit = await emailTemplateService.canUserEditTemplate(userId, id, role);
    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this template' });
    }

    const deleted = await emailTemplateService.deleteTemplate(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

/** POST /api/email-templates/:id/clone — clone a template */
router.post('/:id/clone', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const userId = (req.session as any).userId;
    const cloned = await emailTemplateService.cloneTemplate(id, userId);
    res.status(201).json({ success: true, template: cloned });
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(500).json({ success: false, message: 'Failed to clone template' });
  }
});

// ── Preview ───────────────────────────────────────────────────────────────────

/** POST /api/email-templates/:id/preview — render a template with sample or invite data */
router.post('/:id/preview', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const template = await emailTemplateService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Use invite-based variables if inviteId provided, otherwise sample data
    const { inviteId } = req.body;
    let variables: Record<string, any>;
    if (inviteId) {
      variables = await emailVariableService.buildVariableContext(inviteId);
    } else {
      variables = await emailVariableService.getSampleVariables();
    }

    const { html, plainText } = emailVariableService.renderBoth(
      template.htmlContent,
      template.plainTextContent,
      variables,
    );

    const subject = emailVariableService.renderTemplate(template.subject, variables);

    res.json({ success: true, preview: { subject, html, plainText, variables } });
  } catch (error) {
    console.error('Error previewing template:', error);
    res.status(500).json({ success: false, message: 'Failed to preview template' });
  }
});

// ── Assignments (admin only) ──────────────────────────────────────────────────

/** POST /api/email-templates/:id/assign — assign template to a facilitator */
router.post('/:id/assign', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const { assignedTo, canEdit, canReassign } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'assignedTo is required' });
    }

    const adminId = (req.session as any).userId;
    const assignment = await emailTemplateService.assignTemplate({
      templateId,
      assignedTo,
      assignedBy: adminId,
      canEdit,
      canReassign,
    });

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    console.error('Error assigning template:', error);
    res.status(500).json({ success: false, message: 'Failed to assign template' });
  }
});

/** DELETE /api/email-templates/:id/assign/:userId — remove assignment */
router.delete('/:id/assign/:userId', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(templateId) || isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    await emailTemplateService.removeAssignment(templateId, userId);
    res.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    console.error('Error removing assignment:', error);
    res.status(500).json({ success: false, message: 'Failed to remove assignment' });
  }
});

/** GET /api/email-templates/:id/assignments — list assignments for a template */
router.get('/:id/assignments', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const assignments = await emailTemplateService.getAssignmentsForTemplate(templateId);
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
});

export default router;
