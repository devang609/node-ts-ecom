import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type Sequelize
} from 'sequelize';

export class CartItem extends Model<
  InferAttributes<CartItem, { omit: 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<CartItem, { omit: 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;

  declare userId: string;

  declare productId: string;

  declare quantity: number;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

export function initCartItemModel(sequelizeInstance: Sequelize) {
  CartItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'cart_items',
      modelName: 'CartItem',
      underscored: true
    }
  );
}

