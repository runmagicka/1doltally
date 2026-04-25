const { UserCustomOption } = require("../models");

class OptionController {
  static async getAll(req, res, next) {
    try {
      const where = { userId: req.user.id };
      if (req.query.category) where.category = req.query.category;

      const options = await UserCustomOption.findAll({
        where,
        attributes: ["id", "category", "label"],
        order: [["createdAt", "ASC"]],
      });

      res.status(200).json({ options });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { category, label } = req.body;

      if (!category)
        throw { name: "BadRequest", message: "Category is required" };
      if (!label) throw { name: "BadRequest", message: "Label is required" };

      const option = await UserCustomOption.create({
        userId: req.user.id,
        category,
        label,
      });

      res.status(201).json({ option });
    } catch (error) {
      next(error);
    }
  }
  static async destroy(req, res, next) {
    try {
      const option = await UserCustomOption.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!option) throw { name: "NotFound", message: "Option not found" };

      await option.destroy();

      res.status(200).json({ message: "Option deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OptionController;
