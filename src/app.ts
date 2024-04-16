import express from 'express';
import healthRoutes from './routes/health.routes';
import notificationRoutes from './routes/notification.routes';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { webhookQueue } from './queue/queues/webhook.queue';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bull Board
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(webhookQueue)],
  serverAdapter
});
serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// Routes
app.use('/health', healthRoutes);
app.use('/notifications', notificationRoutes);

export default app;
