import httpStatus from 'http-status';
import type { RequestHandler } from 'express';

import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { getCart, upsertCartItems } from '../services/cart.service.js';

export const postCart: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  await upsertCartItems({
    userId: auth.userId,
    items: req.body.items as { productId: string; quantity: number }[]
  });

  res.json({ ok: true });
});

export const getCartItems: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const result = await getCart({ userId: auth.userId });
  res.json(result);
});

