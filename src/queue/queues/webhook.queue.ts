import { Queue, Worker, type Job } from 'bullmq';
import { processWebhook } from '../../services/notification';
import { bullConnection, defaultJobOptions } from '../config';
import { sendToKinesis } from '../../services/event_stream';

const queueName = 'webhookQueue';

const webhookQueue = new Queue(queueName, {
  connection: bullConnection,
  defaultJobOptions
});

const worker = new Worker(
  queueName,
  async (job: Job) => {
    console.log(`Processing job ${job.id}`);
    const { timestamp, status, externalId } = job.data;
    await processWebhook(timestamp, status, externalId);
  },
  { connection: bullConnection }
);

worker.on('completed', async (job: Job) => {
  await sendToKinesis('notification', JSON.stringify({ ...job.data }));
  console.log(`Job '${job.name}' completed`);
});

worker.on('failed', (job?: Job) => {
  if (job) {
    console.log(`Job '${job.name}' failed`);
  }
});

export { webhookQueue, worker };
