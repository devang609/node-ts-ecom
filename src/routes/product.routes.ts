import { Router } from 'express';

import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  deleteSellerProductById,
  getAllProducts,
  getSellerProducts,
  patchSellerProduct,
  postSellerProduct
} from '../controllers/product.controller.js';
import { createSellerProduct, deleteSellerProduct, listAllProducts, listSellerProducts, updateSellerProduct } from '../validations/product.validation.js';

const router = Router();

router.get('/product/all', validate(listAllProducts), getAllProducts);

router.get('/product/seller', auth(['SELLER', 'ADMIN']), validate(listSellerProducts), getSellerProducts);
router.post('/product/seller', auth(['SELLER', 'ADMIN']), validate(createSellerProduct), postSellerProduct);
router.patch('/product/seller/:productId', auth(['SELLER', 'ADMIN']), validate(updateSellerProduct), patchSellerProduct);
router.delete('/product/seller/:productId', auth(['SELLER', 'ADMIN']), validate(deleteSellerProduct), deleteSellerProductById);

export default router;

