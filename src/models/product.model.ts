import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type Sequelize
} from 'sequelize';

export class Product extends Model<
  InferAttributes<Product, { omit: 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<Product, { omit: 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;

  declare sellerId: string;

  declare name: string;

  declare category: string;

  declare description: string | null;

  declare brand: string | null;

  declare priceCents: number;

  declare stockQuantity: number;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

export function initProductModel(sequelizeInstance: Sequelize) {
  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      sellerId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      brand: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      priceCents: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'products',
      modelName: 'Product',
      underscored: true
    }
  );
}

