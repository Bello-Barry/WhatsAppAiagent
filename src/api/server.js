import express from 'express';
import cors from 'cors';
import logger from '../utils/logger.js';
import qrRoutes from './routes/qr.js';
import agentRoutes from './routes/agents.js';
import { authenticate } from './middleware/auth.js';

export const startApiServer = (port) => {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Simple request logger middleware
  app.use((req, res, next) => {
    logger.info(`API Request: ${req.method} ${req.url}`);
    next();
  });

  // Routes
  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'WhatsApp AI SaaS API is running' });
  });
  
  // Secure all agent-related routes
  app.use('/api/qr', authenticate, qrRoutes);
  app.use('/api/agents', authenticate, agentRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.listen(port, () => {
    logger.info(`API server listening on http://localhost:${port}`);
  });
};