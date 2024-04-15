import { Queue, Worker, type Job } from 'bullmq';
import { processWebhook } from '../../services/notification';
import { bullConnection, defaultJobOptions } from '../config';

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

worker.on('completed', (job: Job) => {
  // TODO: enviar aqui os dados de atualização
  console.log(`Job '${job.name}' completed`);
});

worker.on('failed', (job?: Job) => {
  if (job) {
    console.log(`Job '${job.name}' failed`);
  }
});

export { webhookQueue, worker };
