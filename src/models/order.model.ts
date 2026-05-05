import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type Sequelize
} from 'sequelize';

export const orderStatuses = ['PLACED'] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export class Order extends Model<
  InferAttributes<Order, { omit: 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<Order, { omit: 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;

  declare userId: string;

  declare status: OrderStatus;

  declare totalCents: number;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

export function initOrderModel(sequelizeInstance: Sequelize) {
  Order.init(
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
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'PLACED',
        validate: {
          isIn: [orderStatuses]
        }
      },
      totalCents: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'orders',
      modelName: 'Order',
      underscored: true
    }
  );
}

