const bullConnection = {
  host: 'localhost',
  port: 6379
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
