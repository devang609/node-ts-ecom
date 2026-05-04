import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type Sequelize
} from 'sequelize';

export class UserSession extends Model<
  InferAttributes<UserSession, { omit: 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<UserSession, { omit: 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;

  declare userId: string;

  declare refreshTokenHash: string;

  declare revokedAt: Date | null;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

export function initUserSessionModel(sequelizeInstance: Sequelize) {
  UserSession.init(
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
      refreshTokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'user_sessions',
      modelName: 'UserSession',
      underscored: true
    }
  );
}
