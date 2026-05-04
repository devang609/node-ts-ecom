import { Router } from 'express';

import httpStatus from 'http-status';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(httpStatus.OK).json({ status: 'ok' });
});

export default router;

