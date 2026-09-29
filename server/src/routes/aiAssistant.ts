import { Router, Request, Response } from 'express';
import { getDateOffset } from '../seed/seedData';
import { AllocationEngine } from '../allocation/engine';
import { FacilityType } from '../types';

const router = Router();

// Rule-based and semantic natural language parser
function parseNaturalLanguage(prompt: string) {
  const p = prompt.toLowerCase();

  // 1. Facility Type detection
  let facilityType: FacilityType = 'Classroom';
  if (p.includes('computer lab') || p.includes('pc lab') || p.includes('computing lab')) {
    facilityType = 'Computer Lab';
  } else if (p.includes('electronics lab') || p.includes('vlsi') || p.includes('circuit')) {
    facilityType = 'Electronics Lab';
  } else if (p.includes('physics lab')) {
    facilityType = 'Physics Lab';
  } else if (p.includes('chemistry lab')) {
    facilityType = 'Chemistry Lab';
  } else if (p.includes('seminar hall') || p.includes('symposium hall')) {
    facilityType = 'Seminar Hall';
  } else if (p.includes('auditorium')) {
    facilityType = 'Auditorium';
  } else if (p.includes('meeting room') || p.includes('conference room')) {
    facilityType = 'Meeting Room';
  } else if (p.includes('project room') || p.includes('innovation')) {
    facilityType = 'Project Room';
  } else if (p.includes('sports') || p.includes('badminton') || p.includes('gym')) {
    facilityType = 'Sports Facility';
  }

  // 2. Capacity detection (e.g. "for 55 students", "capacity 60", "50 people")
  let capacity = 40;
  const capMatch = p.match(/(\d+)\s*(students|people|seats|attendees|participants)?/);
  if (capMatch && parseInt(capMatch[1], 10) > 0) {
    // If not a time hour like 2 to 4
    const num = parseInt(capMatch[1], 10);
    if (num > 5 && num < 1000) {
      capacity = num;
    }
  }

  // 3. Date detection
  let date = getDateOffset(1); // default tomorrow
  if (p.includes('today')) {
    date = getDateOffset(0);
  } else if (p.includes('tomorrow')) {
    date = getDateOffset(1);
  } else if (p.includes('day after tomorrow')) {
    date = getDateOffset(2);
  } else {
    const dateMatch = p.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (dateMatch) {
      date = dateMatch[1];
    }
  }

  // 4. Time detection (e.g. "from 2 to 4 pm", "14:00 to 16:00", "2pm - 4pm", "9 am to 11 am")
  let startTime = '14:00';
  let endTime = '16:00';

  if (p.includes('2 to 4 pm') || p.includes('2pm to 4pm') || p.includes('2:00 to 4:00 pm') || p.includes('2 - 4 pm')) {
    startTime = '14:00';
    endTime = '16:00';
  } else if (p.includes('9 to 11 am') || p.includes('9am to 11am')) {
    startTime = '09:00';
    endTime = '11:00';
  } else if (p.includes('10 to 12') || p.includes('10am to 12pm')) {
    startTime = '10:00';
    endTime = '12:00';
  } else if (p.includes('11 to 1') || p.includes('11am to 1pm')) {
    startTime = '11:00';
    endTime = '13:00';
  } else {
    // Regex for HH:mm - HH:mm
    const timeMatch = p.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*(to|-)\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let startH = parseInt(timeMatch[1], 10);
      const isStartPm = timeMatch[3]?.toLowerCase() === 'pm';
      if (isStartPm && startH < 12) startH += 12;

      let endH = parseInt(timeMatch[5], 10);
      const isEndPm = (timeMatch[7] || timeMatch[3])?.toLowerCase() === 'pm';
      if (isEndPm && endH < 12) endH += 12;

      startTime = `${String(startH).padStart(2, '0')}:00`;
      endTime = `${String(endH).padStart(2, '0')}:00`;
    }
  }

  // 5. Equipment detection
  const equipment: string[] = [];
  if (p.includes('projector')) equipment.push('Projector');
  if (p.includes('internet') || p.includes('wifi') || p.includes('lan')) equipment.push('Internet');
  if (p.includes('computer') || p.includes('pc') || facilityType === 'Computer Lab') equipment.push('Computers');
  if (p.includes('ac') || p.includes('air conditioning')) equipment.push('Air Conditioning');
  if (p.includes('smart board') || p.includes('smartboard')) equipment.push('Smart Board');
  if (p.includes('whiteboard')) equipment.push('Whiteboard');
  if (p.includes('audio') || p.includes('mic') || p.includes('sound')) equipment.push('Audio System');
  if (p.includes('video conf') || p.includes('zoom')) equipment.push('Video Conferencing');

  return {
    facilityType,
    capacity,
    date,
    startTime,
    endTime,
    equipment,
  };
}

// POST /api/ai/parse-request
router.post('/parse-request', (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt string is required.' });
  }

  const structured = parseNaturalLanguage(prompt);

  // Directly evaluate using the deterministic constraint/optimization engine
  const allocation = AllocationEngine.evaluateRequest({
    facility_type: structured.facilityType,
    capacity_required: structured.capacity,
    date: structured.date,
    start_time: structured.startTime,
    end_time: structured.endTime,
    required_equipment: structured.equipment,
  });

  // Generate natural language explanation
  let aiExplanation = '';
  if (allocation.recommendedFacility) {
    aiExplanation = `${allocation.recommendedFacility.name} was selected because it satisfies your requirement of ${structured.capacity} seats (${allocation.recommendedFacility.capacity} capacity), includes all requested equipment (${structured.equipment.join(', ')}), has zero scheduling conflicts for ${structured.startTime}-${structured.endTime}, and maintains balanced utilization across campus facilities.`;
  } else {
    aiExplanation = `No campus facility satisfies all strict constraints for this request. ${allocation.rejectedFacilitiesCount || 0} facilities were evaluated and rejected due to either capacity, equipment, or booking conflicts.`;
  }

  return res.json({
    originalPrompt: prompt,
    structuredParameters: structured,
    allocationResult: allocation,
    aiExplanation,
  });
});

export default router;
