import { Router } from 'express';
import { agentManager } from '../../core/agent-manager.js';
import logger from '../../utils/logger.js';

const router = Router();

router.get('/:agentId', async (req, res) => {
  const { agentId } = req.params;
  const agent = agentManager.getAgent(agentId);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  if (agent.status === 'CONNECTED') {
    return res.status(200).json({ status: 'CONNECTED', message: 'Agent is already connected.' });
  }

  try {
    const qrCodeBase64 = await agent.getQrCodeBase64();
    if (qrCodeBase64) {
      res.status(200).json({ status: 'QR_CODE', qr: qrCodeBase64 });
    } else {
      res.status(200).json({ status: 'WAITING', message: 'Waiting for QR code to be generated...' });
    }
  } catch (error) {
    logger.error(error, `Failed to get QR code for agent ${agentId}`);
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

export default router;
