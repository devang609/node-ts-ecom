import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database';
import { UserRole } from '../types/user.types';


export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  // CreationOptional = Sequelize fills this in; we don't supply it on create
  declare id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare role: UserRole;

  // validAfter is the logout-all-devices mechanism:
  // any token issued BEFORE this timestamp is treated as invalid.
  declare validAfter: CreationOptional<Date>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.BUYER,
    },
    validAfter: {
      type: DataTypes.DATE,
      allowNull: false,
      // All tokens issued after epoch 0 are valid by default.
      // On logout, this is bumped to Date.now() to invalidate all sessions.
      defaultValue: new Date(0),
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);