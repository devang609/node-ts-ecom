import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from "../configs/database"; // Your Sequelize instance
import User from "./User"; // Import User model

interface ProductProperties {
  product_id: string;
  product_name: string;
  brand_name: string;
  category: string;
  description: string;
  price: number;
  userId: string; // Foreign key to associate a product with a user
}

class Product extends Model<ProductProperties> implements ProductProperties {
  public product_id!: string;
  public product_name!: string;
  public brand_name!: string;
  public category!: string;
  public description!: string;
  public price!: number;
  public userId!: string; // Foreign key to associate with User
}

Product.init(
  {
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,  // Generate a UUID for each product
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
        key: "id",     
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);

Product.belongsTo(User, { foreignKey: "userId" });

export default Product;