import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/settings
router.get('/', (req: Request, res: Response) => {
  return res.json({ settings: db.getSettings() });
});

// PUT /api/settings (Admin only)
router.put('/', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { weights, thresholds } = req.body;

  const updated = db.updateSettings({ weights, thresholds });

  db.addAuditLog({
    user_id: req.user!.id,
    user_name: req.user!.name,
    action: 'SETTINGS_UPDATED',
    entity_type: 'SYSTEM_SETTINGS',
    entity_id: 'GLOBAL',
    details: `Updated allocation scoring weights and utilization thresholds.`,
  });

  return res.json({
    message: 'System configuration updated successfully.',
    settings: updated,
  });
});

export default router;
