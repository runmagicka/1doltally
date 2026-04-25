"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsTo(models.User, { foreignKey: "userId" });
      Group.belongsToMany(models.Idol, {
        through: models.IdolGroup,
        foreignKey: "groupId",
        otherKey: "idolId",
      });
    }
  }
  Group.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "userId is required" },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Group name is required" },
          notEmpty: { msg: "Group name is required" },
        },
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Group",
      hooks: {
        beforeValidate(group) {
          if (group.name) {
            group.name = group.name.trim().toLowerCase();
          }
        },
      },
    },
  );

  return Group;
};
