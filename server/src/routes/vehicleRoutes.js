const express = require("express");
const {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  listMyVehicles,
  getVehicleSummary,
  listCategories,
} = require("../controllers/vehicleController");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAsgardeoAuth } = require("../middleware/requireAsgardeoAuth");

const router = express.Router();

router.get("/", asyncHandler(listVehicles));
router.get("/summary", asyncHandler(getVehicleSummary));
router.get("/categories", asyncHandler(listCategories));
router.get("/mine", requireAsgardeoAuth, asyncHandler(listMyVehicles));
router.get("/:id", asyncHandler(getVehicleById));
router.post("/", requireAsgardeoAuth, asyncHandler(createVehicle));
router.patch("/:id", requireAsgardeoAuth, asyncHandler(updateVehicle));
router.delete("/:id", requireAsgardeoAuth, asyncHandler(deleteVehicle));

module.exports = router;
