const bullConnection = {
  host: String(process.env.REDIS_HOST),
  port: +(process.env.REDIS_PORT ?? 6379)
};

const defaultJobOptions = {
  delay: Number(process.env.BULL_JOB_DELAY_MS),
  attempts: Number(process.env.BULL_ATTEMPTS_DELAY),
  backoff: {
    type: 'exponential',
    delay: Number(process.env.BULL_BACKOFF_DELAY_MS)
  }
};

export { bullConnection, defaultJobOptions };
