import httpStatus from 'http-status';
import type { RequestHandler } from 'express';

import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createProduct, deleteProduct, listAllProducts, listSellerProducts, updateProduct } from '../services/product.service.js';

export const getAllProducts: RequestHandler = catchAsync(async (req, res) => {
  const result = await listAllProducts({
    page: req.query.page as unknown as number,
    limit: req.query.limit as unknown as number,
    sortBy: req.query.sortBy as string | undefined,
    category: req.query.category as string | undefined,
    brand: req.query.brand as string | undefined,
    sellerId: req.query.sellerId as string | undefined
  });

  res.json(result);
});

export const getSellerProducts: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const result = await listSellerProducts({
    actorUserId: auth.userId,
    actorRole: auth.role,
    page: req.query.page as unknown as number,
    limit: req.query.limit as unknown as number,
    sortBy: req.query.sortBy as string | undefined,
    sellerId: req.query.sellerId as string | undefined
  });

  res.json(result);
});

export const postSellerProduct: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const product = await createProduct({
    actorUserId: auth.userId,
    actorRole: auth.role,
    sellerId: req.body.sellerId as string | undefined,
    name: req.body.name as string,
    category: req.body.category as string,
    description: req.body.description as string | undefined,
    brand: req.body.brand as string | undefined,
    priceCents: req.body.priceCents as number,
    stockQuantity: req.body.stockQuantity as number
  });

  res.status(httpStatus.CREATED).json(product);
});

export const patchSellerProduct: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const product = await updateProduct({
    actorUserId: auth.userId,
    actorRole: auth.role,
    productId: req.params.productId,
    update: {
      ...(typeof req.body.name !== 'undefined' ? { name: req.body.name as string } : {}),
      ...(typeof req.body.category !== 'undefined' ? { category: req.body.category as string } : {}),
      ...(typeof req.body.description !== 'undefined' ? { description: req.body.description as string | null } : {}),
      ...(typeof req.body.brand !== 'undefined' ? { brand: req.body.brand as string | null } : {}),
      ...(typeof req.body.priceCents !== 'undefined' ? { priceCents: req.body.priceCents as number } : {}),
      ...(typeof req.body.stockQuantity !== 'undefined' ? { stockQuantity: req.body.stockQuantity as number } : {})
    }
  });

  res.json(product);
});

export const deleteSellerProductById: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  await deleteProduct({
    actorUserId: auth.userId,
    actorRole: auth.role,
    productId: req.params.productId
  });

  res.json({ ok: true });
});

