const bullConnection = {
  host: String(process.env.REDIS_HOST),
  port: +(process.env.REDIS_PORT ?? 6379)
};

const defaultJobOptions = {
  delay: 500,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  }
};

export { bullConnection, defaultJobOptions };
