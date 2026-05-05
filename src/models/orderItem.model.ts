import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type Sequelize
} from 'sequelize';

export class OrderItem extends Model<
  InferAttributes<OrderItem, { omit: 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<OrderItem, { omit: 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;

  declare orderId: string;

  declare productId: string;

  declare quantity: number;

  declare unitPriceCents: number;

  declare lineTotalCents: number;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

export function initOrderItemModel(sequelizeInstance: Sequelize) {
  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      orderId: {
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
      },
      unitPriceCents: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      lineTotalCents: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'order_items',
      modelName: 'OrderItem',
      underscored: true
    }
  );
}

