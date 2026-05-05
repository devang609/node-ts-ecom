import httpStatus from 'http-status';

import { ApiError } from '../utils/ApiError.js';
import { CartItem, Product } from '../models/index.js';

export async function upsertCartItems(params: {
  userId: string;
  items: { productId: string; quantity: number }[];
}): Promise<void> {
  if (params.items.length === 0) return;

  const productIds = Array.from(new Set(params.items.map((item) => item.productId)));
  const existingProducts = await Product.findAll({ where: { id: productIds } });
  if (existingProducts.length !== productIds.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  for (const item of params.items) {
    const [updated] = await CartItem.update(
      { quantity: item.quantity },
      { where: { userId: params.userId, productId: item.productId } }
    );

    if (updated === 0) {
      await CartItem.create({ userId: params.userId, productId: item.productId, quantity: item.quantity });
    }
  }
}

export async function getCart(params: { userId: string }): Promise<{
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      sellerId: string;
      name: string;
      category: string;
      description: string | null;
      brand: string | null;
      priceCents: number;
      stockQuantity: number;
    };
  }>;
}> {
  const rows = await CartItem.findAll({
    where: { userId: params.userId },
    include: [{ model: Product }]
  });

  const items = rows.map((row) => {
    const product = (row as unknown as { Product?: Product }).Product;
    if (!product) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Cart item product missing');
    }

    return {
      id: row.id,
      productId: row.productId,
      quantity: row.quantity,
      product: {
        id: product.id,
        sellerId: product.sellerId,
        name: product.name,
        category: product.category,
        description: product.description,
        brand: product.brand,
        priceCents: product.priceCents,
        stockQuantity: product.stockQuantity
      }
    };
  });

  return { items };
}
