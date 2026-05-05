import type { RequestHandler } from 'express';
import httpStatus from 'http-status';

import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import * as adminUserService from '../services/adminUser.service.js';

export const listUsers: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const result = await adminUserService.listUsers({
    actorUserId: auth.userId,
    actorRole: auth.role,
    page: req.query.page as unknown as number,
    limit: req.query.limit as unknown as number,
    sortBy: req.query.sortBy as string | undefined,
    role: req.query.role as string | undefined,
    email: req.query.email as string | undefined
  });

  res.json(result);
});

export const getUserById: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const user = await adminUserService.getUserById({
    actorUserId: auth.userId,
    actorRole: auth.role,
    userId: req.params.userId
  });

  res.json(user);
});

export const postUser: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const user = await adminUserService.createUser({
    actorUserId: auth.userId,
    actorRole: auth.role,
    email: req.body.email as string,
    password: req.body.password as string
  });

  res.status(httpStatus.CREATED).json(user);
});

export const patchUser: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const user = await adminUserService.updateUser({
    actorUserId: auth.userId,
    actorRole: auth.role,
    userId: req.params.userId,
    update: {
      ...(typeof req.body.email !== 'undefined' ? { email: req.body.email as string } : {}),
      ...(typeof req.body.password !== 'undefined' ? { password: req.body.password as string } : {}),
      ...(typeof req.body.role !== 'undefined' ? { role: req.body.role as 'BUYER' | 'SELLER' } : {})
    }
  });

  res.json(user);
});

export const deleteUser: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  await adminUserService.deleteUser({
    actorUserId: auth.userId,
    actorRole: auth.role,
    userId: req.params.userId
  });

  res.json({ ok: true });
});

