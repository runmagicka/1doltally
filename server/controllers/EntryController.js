const {
  Entry,
  EntryIdol,
  EntryThought,
  Idol,
  IdolGroup,
} = require("../models");
const cloudinary = require("cloudinary").v2;
const { Op } = require("sequelize");

class EntryController {
  static async getAll(req, res, next) {
    try {
      const { idolId, from, to, limit = 20, offset = 0 } = req.query;

      const where = { userId: req.user.id };

      if (from || to) {
        where.loggedAt = {};
        if (from) where.loggedAt[Op.gte] = new Date(from);
        if (to) where.loggedAt[Op.lte] = new Date(to);
      }

      const includeIdolWhere = idolId ? { id: idolId } : undefined;

      const entries = await Entry.findAll({
        where,
        include: [
          {
            model: Idol,
            attributes: ["id", "name", "photoUrl"],
            through: { attributes: [] },
            ...(includeIdolWhere && {
              where: includeIdolWhere,
              required: true,
            }),
          },
          {
            model: EntryThought,
            attributes: ["id", "tag", "idolIds"],
          },
        ],
        order: [["loggedAt", "DESC"]],
        limit: Number(limit),
        offset: Number(offset),
      });

      res.status(200).json({ entries });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { loggedAt, idols, thoughts, mediumTags, notes } = req.body;

      if (!idols || !idols.length) {
        throw { name: "BadRequest", message: "At least one idol is required" };
      }

      const resolvedIdolIds = [];

      for (const item of idols) {
        if (item.isNewIdol) {
          if (!item.name)
            throw { name: "BadRequest", message: "Idol name is required" };

          const newIdol = await Idol.create({
            name: item.name,
            userId: req.user.id,
          });

          if (item.photoBase64) {
            const result = await cloudinary.uploader.upload(item.photoBase64, {
              folder: "idoltally/idols",
              public_id: `idol_${newIdol.id}`,
              overwrite: true,
              transformation: [{ width: 400, height: 400, crop: "fill" }],
            });
            await newIdol.update({ photoUrl: result.secure_url });
          }

          if (item.groupId) {
            await IdolGroup.findOrCreate({
              where: { idolId: newIdol.id, groupId: item.groupId },
              defaults: { idolId: newIdol.id, groupId: item.groupId },
            });
          }

          resolvedIdolIds.push(newIdol.id);
        } else {
          resolvedIdolIds.push(item.idolId);

          if (item.isNewIdolGroupRelation && item.groupId) {
            await IdolGroup.findOrCreate({
              where: { idolId: item.idolId, groupId: item.groupId },
              defaults: { idolId: item.idolId, groupId: item.groupId },
            });
          }
        }
      }

      const entry = await Entry.create({
        userId: req.user.id,
        loggedAt: loggedAt || new Date(),
        mediumTags: mediumTags || [],
        notes: notes || null,
      });

      await EntryIdol.bulkCreate(
        resolvedIdolIds.map((idolId) => ({ entryId: entry.id, idolId })),
      );

      if (thoughts && thoughts.length) {
        await EntryThought.bulkCreate(
          thoughts.map((t) => ({
            entryId: entry.id,
            tag: t.tag,
            idolIds: t.idolIds === "all" ? resolvedIdolIds : t.idolIds,
          })),
        );
      }

      const full = await Entry.findByPk(entry.id, {
        include: [
          {
            model: Idol,
            attributes: ["id", "name", "photoUrl"],
            through: { attributes: [] },
          },
          {
            model: EntryThought,
            attributes: ["id", "tag", "idolIds"],
          },
        ],
      });

      res.status(201).json({ entry: full });
    } catch (error) {
      next(error);
    }
  }

  static async destroy(req, res, next) {
    try {
      const entry = await Entry.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!entry) throw { name: "NotFound", message: "Entry not found" };

      await entry.destroy();

      res.status(200).json({ message: "Entry deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EntryController;
