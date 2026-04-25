const router = require("express").Router();
const IdolController = require("../controllers/IdolController");
const upload = require("../middlewares/upload");

router.get("/by-group/:groupId", IdolController.byGroup);
router.get("/all-for-log", IdolController.allForLog);

router.get("/", IdolController.getAll);
router.post("/", upload.single("photo"), IdolController.create);
router.patch("/:id", upload.single("photo"), IdolController.update);
router.post("/:id/groups", IdolController.addToGroup);

module.exports = router;
