const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const cloudinary = require("cloudinary").v2;

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const user = await User.create({ username, email, password });

      const token = signToken({ id: user.id, email: user.email });

      res.status(201).json({
        message: "Register successful",
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) throw { name: "BadRequest", message: "Email is required" };
      if (!password)
        throw { name: "BadRequest", message: "Password is required" };

      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      const token = signToken({ id: user.id, email: user.email });

      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "username", "email", "avatar"],
      });

      if (!user) throw { name: "NotFound", message: "User not found" };

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async updateAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw { name: "BadRequest", message: "Avatar image is required" };
      }

      const base64Image = req.file.buffer.toString("base64");
      const base64DataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      const result = await cloudinary.uploader.upload(base64DataUrl, {
        folder: "idoltally/users",
        public_id: `user_${req.user.id}`,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      });

      const user = await User.findByPk(req.user.id);
      await user.update({ avatar: result.secure_url });

      res.status(200).json({
        message: "Avatar updated successfully",
        avatar: result.secure_url,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
