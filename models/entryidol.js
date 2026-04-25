"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EntryIdol extends Model {
    static associate(models) {
      EntryIdol.belongsTo(models.Entry, { foreignKey: "entryId" });
      EntryIdol.belongsTo(models.Idol, { foreignKey: "idolId" });
    }
  }

  EntryIdol.init(
    {
      entryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "entryId is required" },
        },
      },
      idolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "idolId is required" },
        },
      },
    },
    {
      sequelize,
      modelName: "EntryIdol",
    },
  );

  return EntryIdol;
};
