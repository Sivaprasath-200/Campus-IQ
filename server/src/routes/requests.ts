import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { ResourceRequest } from '../types';

const router = Router();

// GET /api/requests
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const requests = db.getRequests();
  const user = req.user!;

  if (user.role === 'ADMIN') {
    return res.json({ total: requests.length, requests });
  }

  // Non-admins see only their own requests
  const userRequests = requests.filter((r) => r.user_id === user.id);
  return res.json({ total: userRequests.length, requests: userRequests });
});

// GET /api/requests/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const request = db.getRequestById(id);

  if (!request) {
    return res.status(404).json({ error: 'Resource request not found.' });
  }

  return res.json({ request });
});

// POST /api/requests
router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const {
    facility_type,
    capacity_required,
    date,
    start_time,
    end_time,
    purpose,
    preferred_facility_id,
    required_equipment,
    special_requirements,
    priority,
  } = req.body;

  if (!facility_type || !capacity_required || !date || !start_time || !end_time || !purpose) {
    return res.status(400).json({ error: 'Missing required request parameters.' });
  }

  const user = req.user!;
  const newRequest: ResourceRequest = {
    id: `req-${Date.now()}`,
    user_id: user.id,
    user_name: user.name,
    department: user.department,
    facility_type,
    capacity_required: Number(capacity_required),
    date,
    start_time,
    end_time,
    purpose,
    preferred_facility_id,
    required_equipment: required_equipment || [],
    special_requirements,
    priority: priority || 'MEDIUM',
    status: 'PENDING',
    created_at: new Date().toISOString(),
  };

  db.createRequest(newRequest);

  db.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'REQUEST_SUBMITTED',
    entity_type: 'RESOURCE_REQUEST',
    entity_id: newRequest.id,
    details: `Resource request submitted for ${facility_type} (${capacity_required} seats) on ${date}.`,
  });

  return res.status(201).json({
    message: 'Resource request submitted successfully.',
    request: newRequest,
  });
});

export default router;
