import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from "../configs/database"; // Your Sequelize instance
import Product from "./Product"; // Import Product model

interface UserProperties {
  user_id: string;
  email: string;
  password: string;
  cart?: Product[]; 
}

class User extends Model<UserProperties> implements UserProperties {
  public user_id!: string;
  public email!: string;
  public password!: string;
  public cart!: Product[];
}

User.init(
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,  
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,  
  }
);

User.hasMany(Product, { foreignKey: "userId", as: "cart" });

export default User;