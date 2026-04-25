const router = require("express").Router();
const OptionController = require("../controllers/OptionController");

router.get("/", OptionController.getAll);
router.post("/", OptionController.create);
router.delete("/:id", OptionController.destroy);

module.exports = router;
