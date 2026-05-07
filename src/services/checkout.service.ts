import httpStatus from 'http-status';
import { Op } from 'sequelize';

import { ApiError } from '../utils/ApiError.js';
import { CartItem, Order, OrderItem, Product } from '../models/index.js';
import { sequelize } from '../db/sequelize.js';
import { publishInventoryUpdated } from '../realtime/inventoryEvents.js';

export async function checkout(params: {
  userId: string;
  items: { productId: string; quantity: number }[];
}): Promise<{ orderId: string }> {
  const items = params.items;
  if (items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Items are required');
  }

  const uniqueProductIds = Array.from(new Set(items.map((i) => i.productId))).sort();

  const result = await sequelize.transaction(async (transaction): Promise<{
    orderId: string;
    inventoryUpdates: { productId: string; stockQuantity: number }[];
  }> => {
    const products = await Product.findAll({
      where: { id: { [Op.in]: uniqueProductIds } },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (products.length !== uniqueProductIds.length) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    let totalCents = 0;
    const orderItemsToCreate: Array<{
      productId: string;
      quantity: number;
      unitPriceCents: number;
      lineTotalCents: number;
    }> = [];

    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
      }

      if (product.stockQuantity < item.quantity) {
        throw new ApiError(httpStatus.CONFLICT, 'Insufficient stock');
      }

      const lineTotalCents = item.quantity * product.priceCents;
      totalCents += lineTotalCents;
      orderItemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        lineTotalCents
      });
    }

    const order = await Order.create(
      {
        userId: params.userId,
        status: 'PLACED',
        totalCents
      },
      { transaction }
    );

    await OrderItem.bulkCreate(
      orderItemsToCreate.map((oi) => ({
        orderId: order.id,
        productId: oi.productId,
        quantity: oi.quantity,
        unitPriceCents: oi.unitPriceCents,
        lineTotalCents: oi.lineTotalCents
      })),
      { transaction }
    );

    for (const item of items) {
      const product = productById.get(item.productId)!;
      product.stockQuantity = product.stockQuantity - item.quantity;
      await product.save({ transaction });
    }

    await CartItem.destroy({
      where: { userId: params.userId, productId: { [Op.in]: uniqueProductIds } },
      transaction
    });

    return {
      orderId: order.id,
      inventoryUpdates: products.map((p) => ({ productId: p.id, stockQuantity: p.stockQuantity }))
    };
  });

  for (const update of result.inventoryUpdates) {
    publishInventoryUpdated({ productId: update.productId, stockQuantity: update.stockQuantity });
  }

  return { orderId: result.orderId };
}
