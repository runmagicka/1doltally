const router = require("express").Router();
const GroupController = require("../controllers/GroupController");
const upload = require("../middlewares/upload");

router.get("/", GroupController.getAll);
router.post("/", upload.single("photo"), GroupController.create);
router.patch("/:id", upload.single("photo"), GroupController.update);
router.delete("/:id", GroupController.destroy);

module.exports = router;
