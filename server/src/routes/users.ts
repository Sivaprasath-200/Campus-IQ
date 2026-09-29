import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// GET /api/users
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const bookings = db.getBookings();

  const safeUsers = users.map((u) => {
    const userBookings = bookings.filter((b) => b.user_id === u.id);
    const { password_hash, ...rest } = u;
    return {
      ...rest,
      total_bookings: userBookings.length,
      active_bookings: userBookings.filter((b) => b.status === 'CONFIRMED').length,
    };
  });

  return res.json({
    total: safeUsers.length,
    users: safeUsers,
  });
});

// PUT /api/users/:id/role (Admin only)
router.put('/:id/role', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'FACULTY', 'STUDENT'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.role = role as UserRole;
  user.updated_at = new Date().toISOString();
  db.persist();

  db.addAuditLog({
    user_id: req.user!.id,
    user_name: req.user!.name,
    action: 'USER_ROLE_CHANGED',
    entity_type: 'USER',
    entity_id: id,
    details: `Changed role of ${user.name} to ${role}.`,
  });

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

export default router;
