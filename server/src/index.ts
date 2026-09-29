import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import facilitiesRoutes from './routes/facilities';
import bookingsRoutes from './routes/bookings';
import requestsRoutes from './routes/requests';
import allocationRoutes from './routes/allocation';
import conflictsRoutes from './routes/conflicts';
import analyticsRoutes from './routes/analytics';
import reportsRoutes from './routes/reports';
import settingsRoutes from './routes/settings';
import usersRoutes from './routes/users';
import aiAssistantRoutes from './routes/aiAssistant';
import demoRoutes from './routes/demo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/conflicts', conflictsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/demo', demoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CampusIQ Core Allocation Backend',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` CampusIQ Backend Server running on port ${PORT}`);
  console.log(` REST API available at http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
