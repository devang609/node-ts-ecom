import httpStatus from 'http-status';
import { Op } from 'sequelize';

import { ApiError } from '../utils/ApiError.js';
import { Product } from '../models/index.js';
import type { Role } from '../constants/roles.js';
import { publishInventoryCreated, publishInventoryDeleted, publishInventoryUpdated } from '../realtime/inventoryEvents.js';

type SortDirection = 'asc' | 'desc';

function parseSortBy(sortBy: string | undefined, allowedFields: string[], defaultField: string) {
  const fallback: [string, SortDirection] = [defaultField, 'desc'];
  if (!sortBy) return fallback;

  const [field, direction] = sortBy.split(':');
  if (!field || !direction) return fallback;
  if (!allowedFields.includes(field)) return fallback;
  if (direction !== 'asc' && direction !== 'desc') return fallback;
  return [field, direction] as const;
}

function buildPagination(params: { page: number; limit: number }) {
  const offset = (params.page - 1) * params.limit;
  return { limit: params.limit, offset };
}

export async function listAllProducts(params: {
  page: number;
  limit: number;
  sortBy?: string;
  category?: string;
  brand?: string;
  sellerId?: string;
}): Promise<{ items: Product[]; page: number; limit: number; total: number }> {
  const where: Record<string, unknown> = {};
  if (params.category) where.category = params.category;
  if (params.brand) where.brand = params.brand;
  if (params.sellerId) where.sellerId = params.sellerId;

  const [sortField, sortDirection] = parseSortBy(params.sortBy, ['createdAt', 'priceCents', 'name'], 'createdAt');
  const { limit, offset } = buildPagination(params);

  const { rows, count } = await Product.findAndCountAll({
    where,
    order: [[sortField, sortDirection]],
    limit,
    offset
  });

  return { items: rows, page: params.page, limit: params.limit, total: count };
}

export async function listSellerProducts(params: {
  actorUserId: string;
  actorRole: Role;
  page: number;
  limit: number;
  sortBy?: string;
  sellerId?: string;
}): Promise<{ items: Product[]; page: number; limit: number; total: number }> {
  const effectiveSellerId = params.actorRole === 'ADMIN' && params.sellerId ? params.sellerId : params.actorUserId;

  const [sortField, sortDirection] = parseSortBy(params.sortBy, ['createdAt', 'priceCents', 'name'], 'createdAt');
  const { limit, offset } = buildPagination(params);

  const { rows, count } = await Product.findAndCountAll({
    where: { sellerId: effectiveSellerId },
    order: [[sortField, sortDirection]],
    limit,
    offset
  });

  return { items: rows, page: params.page, limit: params.limit, total: count };
}

export async function createProduct(params: {
  actorUserId: string;
  actorRole: Role;
  sellerId?: string;
  name: string;
  category: string;
  description?: string;
  brand?: string;
  priceCents: number;
  stockQuantity: number;
}): Promise<Product> {
  const effectiveSellerId = params.actorRole === 'ADMIN' && params.sellerId ? params.sellerId : params.actorUserId;

  const product = await Product.create({
    sellerId: effectiveSellerId,
    name: params.name,
    category: params.category,
    description: params.description ?? null,
    brand: params.brand ?? null,
    priceCents: params.priceCents,
    stockQuantity: params.stockQuantity
  });

  publishInventoryCreated({ productId: product.id, stockQuantity: product.stockQuantity });
  return product;
}

export async function updateProduct(params: {
  actorUserId: string;
  actorRole: Role;
  productId: string;
  update: Partial<{
    name: string;
    category: string;
    description: string | null;
    brand: string | null;
    priceCents: number;
    stockQuantity: number;
  }>;
}): Promise<Product> {
  const product = await Product.findByPk(params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (params.actorRole !== 'ADMIN' && product.sellerId !== params.actorUserId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  Object.assign(product, params.update);
  await product.save();

  if (typeof params.update.stockQuantity !== 'undefined') {
    publishInventoryUpdated({ productId: product.id, stockQuantity: product.stockQuantity });
  }
  return product;
}

export async function deleteProduct(params: { actorUserId: string; actorRole: Role; productId: string }): Promise<void> {
  const product = await Product.findByPk(params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (params.actorRole !== 'ADMIN' && product.sellerId !== params.actorUserId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  await Product.destroy({ where: { id: product.id } });
  publishInventoryDeleted({ productId: product.id });
}

export async function assertProductsExist(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;
  const uniqueIds = Array.from(new Set(productIds));
  const count = await Product.count({ where: { id: { [Op.in]: uniqueIds } } });
  if (count !== uniqueIds.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
}
