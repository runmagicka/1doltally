"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Entry extends Model {
    static associate(models) {
      Entry.belongsTo(models.User, { foreignKey: "userId" });
      Entry.belongsToMany(models.Idol, {
        through: models.EntryIdol,
        foreignKey: "entryId",
        otherKey: "idolId",
      });
      Entry.hasMany(models.EntryThought, {
        foreignKey: "entryId",
        onDelete: "CASCADE",
      });
    }
  }

  Entry.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "userId is required" },
        },
      },
      loggedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: { msg: "loggedAt is required" },
          isDate: { msg: "loggedAt must be a valid date" },
        },
      },
      mediumTags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Entry",
    },
  );

  return Entry;
};
