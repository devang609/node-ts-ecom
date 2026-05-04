import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type Sequelize
} from 'sequelize';

import { config } from '../config/config.js';
import type { Role } from '../constants/roles.js';

export class User extends Model<
  InferAttributes<User, { omit: 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<User, { omit: 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;

  declare email: string;

  declare passwordHash: string;

  declare role: Role;

  declare validAfter: CreationOptional<Date>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  override toJSON() {
    const values = super.toJSON() as Record<string, unknown>;
    delete values.passwordHash;
    return values;
  }
}

export function initUserModel(sequelizeInstance: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING(320),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: config.env === 'test' ? DataTypes.STRING : DataTypes.ENUM('BUYER', 'SELLER', 'ADMIN'),
        allowNull: false,
        defaultValue: 'BUYER',
        validate: {
          isIn: [['BUYER', 'SELLER', 'ADMIN']]
        }
      },
      validAfter: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(0)
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'users',
      modelName: 'User',
      underscored: true
    }
  );
}
