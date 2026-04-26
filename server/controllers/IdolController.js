const { Idol, Group, IdolGroup } = require("../models");
const cloudinary = require("cloudinary").v2;
const { Op, literal } = require("sequelize");

class IdolController {
  static async getOne(req, res, next) {
    try {
      const idol = await Idol.findOne({
        where: { id: req.params.id, userId: req.user.id },
        include: [
          {
            model: Group,
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
      });

      if (!idol) throw { name: "NotFound", message: "Idol not found" };

      res.status(200).json({ idol });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { sort = "createdAt" } = req.query;
      const order =
        sort === "name" ? [["name", "ASC"]] : [["createdAt", "DESC"]];

      const idols = await Idol.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Group,
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
        attributes: {
          include: [
            [
              literal(`(
                SELECT COUNT(*)
                FROM "EntryIdols" AS ei
                INNER JOIN "Entries" AS e ON e.id = ei."entryId"
                WHERE ei."idolId" = "Idol".id
                AND e."userId" = ${req.user.id}
              )`),
              "entryCount",
            ],
          ],
        },
        order,
      });

      res.status(200).json({ idols });
    } catch (error) {
      next(error);
    }
  }

  static async byGroup(req, res, next) {
    try {
      const { groupId } = req.params;

      const group = await Group.findOne({
        where: { id: groupId, userId: req.user.id },
      });
      if (!group) throw { name: "NotFound", message: "Group not found" };

      const idolGroupRows = await IdolGroup.findAll({
        where: { groupId },
        order: [["joinedAt", "DESC"]],
      });

      const memberIds = idolGroupRows.map((ig) => ig.idolId);

      const members = await Idol.findAll({
        where: { userId: req.user.id, id: memberIds },
        include: [
          {
            model: Group,
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
        attributes: ["id", "name", "photoUrl"],
      });

      const membersOrdered = memberIds
        .map((id) => members.find((m) => m.id === id))
        .filter(Boolean);

      const others = await Idol.findAll({
        where: {
          userId: req.user.id,
          id: { [Op.notIn]: memberIds.length ? memberIds : [0] },
        },
        include: [
          {
            model: Group,
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
        attributes: ["id", "name", "photoUrl"],
        order: [["name", "ASC"]],
      });

      res.status(200).json({ members: membersOrdered, others });
    } catch (error) {
      next(error);
    }
  }

  static async allForLog(req, res, next) {
    try {
      const idols = await Idol.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Group,
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
        attributes: ["id", "name", "photoUrl"],
        order: [["name", "ASC"]],
      });

      res.status(200).json({ idols });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, groupId } = req.body;

      if (!name) throw { name: "BadRequest", message: "Idol name is required" };

      const idol = await Idol.create({ name, userId: req.user.id });

      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const base64DataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(base64DataUrl, {
          folder: "idoltally/idols",
          public_id: `idol_${idol.id}`,
          overwrite: true,
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        });

        await idol.update({ photoUrl: result.secure_url });
      }

      if (groupId) {
        const group = await Group.findOne({
          where: { id: groupId, userId: req.user.id },
        });
        if (group) {
          await IdolGroup.create({ idolId: idol.id, groupId });
        }
      }

      res.status(201).json({ idol });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const idol = await Idol.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!idol) throw { name: "NotFound", message: "Idol not found" };

      const updates = {};
      if (req.body.name) updates.name = req.body.name;

      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const base64DataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(base64DataUrl, {
          folder: "idoltally/idols",
          public_id: `idol_${idol.id}`,
          overwrite: true,
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        });

        updates.photoUrl = result.secure_url;
      }

      await idol.update(updates);

      res.status(200).json({ idol });
    } catch (error) {
      next(error);
    }
  }

  static async addToGroup(req, res, next) {
    try {
      const idol = await Idol.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });
      if (!idol) throw { name: "NotFound", message: "Idol not found" };

      const { groupId } = req.body;
      if (!groupId)
        throw { name: "BadRequest", message: "groupId is required" };

      const group = await Group.findOne({
        where: { id: groupId, userId: req.user.id },
      });
      if (!group) throw { name: "NotFound", message: "Group not found" };

      await IdolGroup.findOrCreate({
        where: { idolId: idol.id, groupId },
        defaults: { idolId: idol.id, groupId },
      });

      res
        .status(200)
        .json({ message: `${idol.name} registered to ${group.name}` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IdolController;
