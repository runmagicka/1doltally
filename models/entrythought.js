"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EntryThought extends Model {
    static associate(models) {
      EntryThought.belongsTo(models.Entry, { foreignKey: "entryId" });
    }
  }

  EntryThought.init(
    {
      entryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "entryId is required" },
        },
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "tag is required" },
          notEmpty: { msg: "tag is required" },
        },
      },
      idolIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "EntryThought",
    },
  );

  return EntryThought;
};
