import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendNotification } from '../services/notification';
import { webhookQueue } from '../queue/queues/webhook.queue';

const router = Router();

router.post('/send', async (request: Request, response: Response) => {
  try {
    const { channel, to, body, externalId } = request.body;
    const notification = await sendNotification(channel, to, body, externalId);
    return response.status(201).json(notification);
  } catch (error: any) {
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(
        ({ message, path, value }: any) => `${message}. The value '${value}' is invalid to path '${path}'`
      );
      return response.status(422).json({
        errors: validationErrors
      });
    }
    return response.status(400).json(error);
  }
});

router.post('/webhook', async (request: Request, response: Response) => {
  try {
    const { timestamp, status, externalId } = request.body;
    await webhookQueue.add('processWebhook', { timestamp, status, externalId });
    return response.status(202).json();
  } catch (error) {
    console.error(error);
    return response.status(400).json(error);
  }
});

export default router;
