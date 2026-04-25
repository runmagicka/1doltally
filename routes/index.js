const router = require("express").Router();
const authentication = require("../middlewares/authentication");

const authRouter = require("./auth");
const groupsRouter = require("./groups");
const idolsRouter = require("./idols");
const entriesRouter = require("./entries");
const optionsRouter = require("./options");

// Public
router.use("/auth", authRouter);

// Protected
router.use(authentication);
router.use("/groups", groupsRouter);
router.use("/idols", idolsRouter);
router.use("/entries", entriesRouter);
router.use("/options", optionsRouter);

module.exports = router;
