const { Group, Idol } = require("../models");
const cloudinary = require("cloudinary").v2;

class GroupController {
  static async getAll(req, res, next) {
    try {
      const groups = await Group.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Idol,
            attributes: ["id", "name", "photoUrl"],
            through: { attributes: [] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ groups });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name } = req.body;

      if (!name)
        throw { name: "BadRequest", message: "Group name is required" };

      const group = await Group.create({ name, userId: req.user.id });

      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const base64DataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(base64DataUrl, {
          folder: "idoltally/groups",
          public_id: `group_${group.id}`,
          overwrite: true,
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        });

        await group.update({ photoUrl: result.secure_url });
      }

      res.status(201).json({ group });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const group = await Group.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!group) throw { name: "NotFound", message: "Group not found" };

      const updates = {};
      if (req.body.name) updates.name = req.body.name;

      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const base64DataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(base64DataUrl, {
          folder: "idoltally/groups",
          public_id: `group_${group.id}`,
          overwrite: true,
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        });

        updates.photoUrl = result.secure_url;
      }

      await group.update(updates);

      res.status(200).json({ group });
    } catch (error) {
      next(error);
    }
  }

  static async destroy(req, res, next) {
    try {
      const group = await Group.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!group) throw { name: "NotFound", message: "Group not found" };

      await group.destroy();

      res.status(200).json({ message: "Group deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GroupController;
