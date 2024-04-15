import { Router } from 'express';
import type { Response } from 'express';

const router = Router();

router.get('/', (_, response: Response) => {
  return response.json({ status: 'ok' });
});

export default router;
