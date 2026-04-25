const router = require("express").Router();

const AuthController = require("../controllers/AuthController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;
