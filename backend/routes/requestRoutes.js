const express = require("express")
const { body } = require("express-validator")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const {
  createRequest,
  getBroadcastRequests,
  respondToRequest,
  getRequestStatus,
  updateRequestStatus,
  getUserRequests,
  getMechanicRequests,
  cancelRequest,
} = require("../controllers/requestController")

const router = express.Router()

// @desc    Create a new service request
// @route   POST /api/request/create
// @access  Private (User only)
router.post(
  "/create",
  [
    body("issueDescription")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Issue description must be at least 10 characters"),
    body("location.latitude").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
    body("location.longitude").isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
    body("locationName").trim().isLength({ min: 5 }).withMessage("Location name must be at least 5 characters"),
    body("priority").optional().isIn(["low", "medium", "high", "emergency"]).withMessage("Invalid priority"),
  ],
  authMiddleware,
  roleMiddleware(["user"]),
  createRequest,
)

// @desc    Get pending requests for mechanics
// @route   GET /api/request/broadcast
// @access  Private (Mechanic only)
router.get("/broadcast", authMiddleware, roleMiddleware(["mechanic"]), getBroadcastRequests)

// @desc    Mechanic responds to a request
// @route   POST /api/request/respond
// @access  Private (Mechanic only)
router.post(
  "/respond",
  [
    body("requestId").isMongoId().withMessage("Invalid request ID"),
    body("response").isIn(["accepted", "rejected"]).withMessage("Response must be 'accepted' or 'rejected'"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  respondToRequest,
)

// @desc    Get request status for user
// @route   GET /api/request/status/:requestId
// @access  Private (User only)
router.get("/status/:requestId", authMiddleware, roleMiddleware(["user"]), getRequestStatus)

// @desc    Update request status
// @route   PUT /api/request/:requestId/status
// @access  Private (Mechanic only)
router.put(
  "/:requestId/status",
  [
    body("status").isIn(["in-progress", "completed", "cancelled"]).withMessage("Invalid status"),
    body("actualCost").optional().isFloat({ min: 0 }).withMessage("Cost must be a positive number"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  updateRequestStatus,
)

// @desc    Get user's requests
// @route   GET /api/request/user-requests
// @access  Private (User only)
router.get("/user-requests", authMiddleware, roleMiddleware(["user"]), getUserRequests)

// @desc    Get mechanic's accepted requests
// @route   GET /api/request/mechanic-requests
// @access  Private (Mechanic only)
router.get("/mechanic-requests", authMiddleware, roleMiddleware(["mechanic"]), getMechanicRequests)

// @desc    Cancel request
// @route   PUT /api/request/:requestId/cancel
// @access  Private (User only)
router.put("/:requestId/cancel", authMiddleware, roleMiddleware(["user"]), cancelRequest)

module.exports = router
