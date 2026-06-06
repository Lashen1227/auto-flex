const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");
const { syncAuthenticatedUser, getMyUser } = require("../controllers/userController");

const router = express.Router();

router.post("/sync", asyncHandler(syncAuthenticatedUser));
router.get("/me", asyncHandler(getMyUser));

module.exports = router;
