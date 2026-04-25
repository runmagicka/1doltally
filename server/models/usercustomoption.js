"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserCustomOption extends Model {
    static associate(models) {
      UserCustomOption.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  UserCustomOption.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "userId is required" },
        },
      },
      category: {
        type: DataTypes.ENUM("thought", "medium"),
        allowNull: false,
        validate: {
          notNull: { msg: "category is required" },
          isIn: {
            args: [["thought", "medium"]],
            msg: "category must be 'thought' or 'medium'",
          },
        },
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "label is required" },
          notEmpty: { msg: "label is required" },
        },
      },
    },
    {
      sequelize,
      modelName: "UserCustomOption",
    },
  );

  return UserCustomOption;
};
