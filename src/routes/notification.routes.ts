import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendNotification } from '../services/notification';
import { webhookQueue } from '../queue/queues/webhook.queue';

const router = Router();

router.post('/send', async (request: Request, response: Response) => {
  const { channel, to, body, externalId } = request.body;
  const notification = await sendNotification(channel, to, body, externalId);
  return response.status(201).json(notification);
});

router.post('/webhook', async (request: Request, response: Response) => {
  const { timestamp, status, externalId } = request.body;
  await webhookQueue.add('processWebhook', { timestamp, status, externalId });
  return response.status(202).json();
});

export default router;
