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
    try {
      const { timestamp, event, externalId } = job.data;
      await processWebhook(timestamp, event, externalId);
    } catch (error: any) {
      console.error(`Failed to process job ${job.id}: ${error}`);
    }
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
