"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class IdolGroup extends Model {
    static associate(models) {
      IdolGroup.belongsTo(models.Idol, { foreignKey: "idolId" });
      IdolGroup.belongsTo(models.Group, { foreignKey: "groupId" });
    }
  }
  IdolGroup.init(
    {
      idolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "idolId is required" },
        },
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "groupId is required" },
        },
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "IdolGroup",
    },
  );

  return IdolGroup;
};
