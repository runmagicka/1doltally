const router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const authentication = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected — require token
router.get("/profile", authentication, AuthController.getProfile);
router.patch(
  "/profile/avatar",
  authentication,
  upload.single("avatar"),
  AuthController.updateAvatar,
);

module.exports = router;
