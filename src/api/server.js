import express from 'express';
import cors from 'cors';
import logger from '../utils/logger.js';
import qrRoutes from './routes/qr.js';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';

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
  app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'WhatsApp AI SaaS API is running' });
  });
  
  app.use('/api/auth', authRoutes);
  app.use('/api/qr', qrRoutes);
  app.use('/api/agents', agentRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.listen(port, () => {
    logger.info(`API server listening on http://localhost:${port}`);
  });
};