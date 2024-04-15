import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendNotification } from '../services/notification';

const router = Router();

router.post('/send', async (request: Request, response: Response) => {
  const { channel, to, body, externalId } = request.body;
  const notification = await sendNotification(channel, to, body, externalId);
  return response.status(201).json(notification);
});

router.post('/webhook', (request: Request, response: Response) => {
  return response.status(500).json({ message: 'not yet implemented' });
});

export default router;
