const express = require("express")
const { body } = require("express-validator")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

// ❌ Cache middleware imports commented
// const {
//   cacheMechanicPortfolio,
//   invalidateCacheMiddleware,
//   rateLimitMiddleware,
// } = require("../middlewares/cacheMiddleware")

const {
  getPortfolio,
  updatePortfolio,
  getPublicPortfolio,
  addWorkImage,
  removeWorkImage,
  addCertification,
  updateCertification,
  removeCertification,
} = require("../controllers/portfolioController")

const router = express.Router()

// @desc Get mechanic's own portfolio
// @route GET /api/portfolio
// @access Private (Mechanic only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["mechanic"]),
  getPortfolio
)

// @desc Get public portfolio
// @route GET /api/portfolio/:mechanicId
// @access Public
router.get(
  "/:mechanicId",
  // rateLimitMiddleware(50, 3600), // ❌ commented
  // cacheMechanicPortfolio,       // ❌ commented
  getPublicPortfolio
)

// @desc Update portfolio
// @route PUT /api/portfolio
// @access Private (Mechanic only)
router.put(
  "/",
  [
    body("bio")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Bio must be less than 1000 characters"),
    body("services")
      .optional()
      .isArray()
      .withMessage("Services must be an array"),
    body("isPublic")
      .optional()
      .isBoolean()
      .withMessage("isPublic must be a boolean"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // invalidateCacheMiddleware([(req) => `mechanic:portfolio:${req.user._id}`]), // ❌ commented
  updatePortfolio
)

// @desc Add work image
// @route POST /api/portfolio/work-images
// @access Private (Mechanic only)
router.post(
  "/work-images",
  [
    body("url").isURL().withMessage("Valid image URL is required"),
    body("description")
      .isLength({ min: 1, max: 200 })
      .withMessage("Description is required and must be less than 200 characters"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // rateLimitMiddleware(10, 3600), // ❌ commented
  // invalidateCacheMiddleware([(req) => `mechanic:portfolio:${req.user._id}`]), // ❌ commented
  addWorkImage
)

// @desc Remove work image
// @route DELETE /api/portfolio/work-images/:imageId
// @access Private (Mechanic only)
router.delete(
  "/work-images/:imageId",
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // invalidateCacheMiddleware([(req) => `mechanic:portfolio:${req.user._id}`]), // ❌ commented
  removeWorkImage
)

// @desc Add certification
// @route POST /api/portfolio/certifications
// @access Private (Mechanic only)
router.post(
  "/certifications",
  [
    body("name")
      .isLength({ min: 1, max: 100 })
      .withMessage("Certification name is required"),
    body("issuer")
      .isLength({ min: 1, max: 100 })
      .withMessage("Issuer is required"),
    body("dateObtained")
      .isISO8601()
      .withMessage("Valid date is required"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // rateLimitMiddleware(5, 3600), // ❌ commented
  // invalidateCacheMiddleware([(req) => `mechanic:portfolio:${req.user._id}`]), // ❌ commented
  addCertification
)

// @desc Update certification
// @route PUT /api/portfolio/certifications/:certId
// @access Private (Mechanic only)
router.put(
  "/certifications/:certId",
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // invalidateCacheMiddleware([(req) => `mechanic:portfolio:${req.user._id}`]), // ❌ commented
  updateCertification
)

// @desc Remove certification
// @route DELETE /api/portfolio/certifications/:certId
// @access Private (Mechanic only)
router.delete(
  "/certifications/:certId",
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // invalidateCacheMiddleware([(req) => `mechanic:portfolio:${req.user._id}`]), // ❌ commented
  removeCertification
)

module.exports = router
