const bullConnection = {
  host: String(process.env.REDIS_HOST),
  port: +(process.env.REDIS_PORT ?? 6379)
};

const defaultJobOptions = {
  delay: process.env.BULL_JOB_DELAY_MS,
  attempts: process.env.BULL_ATTEMPTS_DELAY,
  backoff: {
    type: 'exponential',
    delay: process.env.BULL_BACKOFF_DELAY_MS
  }
};

export { bullConnection, defaultJobOptions };
