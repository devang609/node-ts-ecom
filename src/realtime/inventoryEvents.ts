import { broadcastJson } from './ws.js';

export type InventoryStatus = 'IN_STOCK' | 'OUT_OF_STOCK';

function statusFromQuantity(stockQuantity: number): InventoryStatus {
  return stockQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
}

export function publishInventoryCreated(params: { productId: string; stockQuantity: number }) {
  broadcastJson({
    type: 'inventory.created',
    productId: params.productId,
    stockQuantity: params.stockQuantity,
    status: statusFromQuantity(params.stockQuantity)
  });
}

export function publishInventoryUpdated(params: { productId: string; stockQuantity: number }) {
  broadcastJson({
    type: 'inventory.updated',
    productId: params.productId,
    stockQuantity: params.stockQuantity,
    status: statusFromQuantity(params.stockQuantity)
  });
}

export function publishInventoryDeleted(params: { productId: string }) {
  broadcastJson({
    type: 'inventory.deleted',
    productId: params.productId
  });
}

