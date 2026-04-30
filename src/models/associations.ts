import Product from "./Product.ts";
import User from "./User.ts";

User.hasMany(Product, { foreignKey: "userId", sourceKey: "user_id", as: "cart" });
Product.belongsTo(User, { foreignKey: "userId", targetKey: "user_id" });
