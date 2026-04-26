"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Idol extends Model {
    static associate(models) {
      Idol.belongsTo(models.User, { foreignKey: "userId" });
      Idol.belongsToMany(models.Group, {
        through: models.IdolGroup,
        foreignKey: "idolId",
        otherKey: "groupId",
      });
      Idol.belongsToMany(models.Entry, {
        through: models.EntryIdol,
        foreignKey: "idolId",
        otherKey: "entryId",
      });
    }
  }

  Idol.init(
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
          notNull: { msg: "Idol name is required" },
          notEmpty: { msg: "Idol name is required" },
        },
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Idol",
    },
  );

  return Idol;
};
