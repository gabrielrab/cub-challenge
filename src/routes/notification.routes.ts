import { Router } from 'express';
import type { Request, Response } from 'express';
import { processWebhook, sendNotification } from '../services/notification';

const router = Router();

router.post('/send', async (request: Request, response: Response) => {
  const { channel, to, body, externalId } = request.body;
  const notification = await sendNotification(channel, to, body, externalId);
  return response.status(201).json(notification);
});

router.post('/webhook', async (request: Request, response: Response) => {
  const { timestamp, status, externalId } = request.body;
  await processWebhook(timestamp, status, externalId);
  return response.status(200).json();
});

export default router;
