import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getDateOffset } from '../seed/seedData';
import { AllocationEngine } from '../allocation/engine';

const router = Router();

// POST /api/demo/reset
router.post('/reset', (req: Request, res: Response) => {
  db.resetToSeed();
  return res.json({ message: 'CampusIQ database successfully reset to pristine seed state.' });
});

// GET /api/demo/scenario
router.get('/scenario', (req: Request, res: Response) => {
  const tomorrow = getDateOffset(1);
  const scenarioData = {
    title: 'Hackathon Challenge Demonstration Scenario',
    description: 'Find best computer lab for 55 students with Computers, Projector and Internet tomorrow 2-4 PM',
    facility_type: 'Computer Lab',
    capacity_required: 55,
    date: tomorrow,
    start_time: '14:00',
    end_time: '16:00',
    required_equipment: ['Computers', 'Projector', 'Internet'],
    purpose: 'Distributed Systems & AI Hackathon Workshop',
    department: 'CSE',
  };

  return res.json(scenarioData);
});

export default router;
