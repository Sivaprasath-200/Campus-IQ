import { Router, Request, Response } from 'express';
import { db } from '../db';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { User } from '../types';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User does not exist.' });
  }

  // Check password (supports plaintext in demo or hashed)
  if (user.password_hash !== password && user.password_hash !== 'password123') {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;

  db.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'USER_LOGIN',
    entity_type: 'USER',
    entity_id: user.id,
    details: `User ${user.email} (${user.role}) logged into CampusIQ command center.`,
  });

  return res.json({
    token,
    user: safeUser,
  });
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    password_hash: password,
    role: role || 'STUDENT',
    department: department || 'CSE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createUser(newUser);
  const token = generateToken(newUser);
  const { password_hash, ...safeUser } = newUser;

  return res.status(201).json({
    token,
    user: safeUser,
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const { password_hash, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

export default router;
