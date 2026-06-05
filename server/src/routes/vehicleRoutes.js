const express = require("express");
const {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleSummary,
  listCategories,
} = require("../controllers/vehicleController");
const { asyncHandler } = require("../middleware/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(listVehicles));
router.get("/summary", asyncHandler(getVehicleSummary));
router.get("/categories", asyncHandler(listCategories));
router.get("/:id", asyncHandler(getVehicleById));
router.post("/", asyncHandler(createVehicle));
router.patch("/:id", asyncHandler(updateVehicle));
router.delete("/:id", asyncHandler(deleteVehicle));

module.exports = router;
