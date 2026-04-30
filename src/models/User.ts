import { Model, DataTypes } from "sequelize";
import type { Optional } from "sequelize";
import sequelize from "../configs/database.ts"; // Your Sequelize instance
import type Product from "./Product.ts"; // Import Product type only

interface UserProperties {
  user_id: string;
  email: string;
  password: string;
  cart?: Product[];
  validAfter: Date;
}

type UserCreationAttributes = Optional<UserProperties, "user_id" | "cart">;

class User
  extends Model<UserProperties, UserCreationAttributes>
  implements UserProperties
{
  declare user_id: string;
  declare email: string;
  declare password: string;
  declare cart: Product[];
  declare validAfter: Date;
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
    validAfter: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,  
  }
);

export default User;
