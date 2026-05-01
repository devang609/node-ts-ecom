import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from "../configs/database.ts"; // Your Sequelize instance
import type User from "./User.ts"; // Import User type only

interface ProductProperties {
  product_id: string;
  product_name: string;
  brand_name: string;
  category: string;
  description: string;
  price: number;
  userId: string;
}

class Product extends Model<ProductProperties> implements ProductProperties {
  declare product_id: string;
  declare product_name: string;
  declare brand_name: string;
  declare category: string;
  declare description: string;
  declare price: number;
  declare userId: string;
}

Product.init(
  {
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,  
      primaryKey: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: "users",  
        key: "user_id",     
      },
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);

export default Product;
