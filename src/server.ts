import 'dotenv/config';
import express from 'express';

enum ExitStatus {
  Failure = 1,
  Success = 0
}

process.on('unhandledRejection', (reason: any, promise: any) => {
  console.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  );
  throw reason;
});

process.on('uncaughtException', (error: any) => {
  console.error(`App exiting due to an uncaught exception: ${error}`);
  process.exit(ExitStatus.Failure);
});

const PORT = process.env.PORT || 3000;

void (async () => {
  try {
    const app = express();
    const server = app.listen(PORT, () => {
      console.log(`🔥 Api running on port: ${PORT}`);
    });

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    for (const exitSignal of exitSignals) {
      void process.on(exitSignal, () => {
        void (async () => {
          try {
            server.close(async () => {
              // close here all necessary resources
            });
            console.info(`App exited with success`);
            process.exit(ExitStatus.Success);
          } catch (error) {
            server.close();
            console.error(`App exited with error: `, error);
            process.exit(ExitStatus.Failure);
          }
        })();
      });
    }
  } catch (error) {
    console.error(`App exited with exception: ${error}`);
    process.exit(ExitStatus.Failure);
  }
})();
