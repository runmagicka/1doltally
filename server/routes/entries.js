const router = require("express").Router();
const EntryController = require("../controllers/EntryController");

router.get("/", EntryController.getAll);
router.post("/", EntryController.create);
router.delete("/:id", EntryController.destroy);

module.exports = router;
