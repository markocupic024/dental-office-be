import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startScheduler } from './jobs/scheduler';

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${env.NODE_ENV} mode`);
  
  // Start SMS job scheduler
  startScheduler();
});

