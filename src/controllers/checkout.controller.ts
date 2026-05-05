import httpStatus from 'http-status';
import type { RequestHandler } from 'express';

import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { checkout } from '../services/checkout.service.js';

export const postBuy: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const result = await checkout({
    userId: auth.userId,
    items: req.body.items as { productId: string; quantity: number }[]
  });

  res.status(httpStatus.CREATED).json(result);
});

