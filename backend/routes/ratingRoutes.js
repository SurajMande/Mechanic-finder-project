const express = require("express")
const { body, param } = require("express-validator")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const Rating = require("../models/Rating")
const Booking = require("../models/Booking")
const Mechanic = require("../models/Mechanic")
const { validationResult } = require("express-validator")

const router = express.Router()

// @desc    Submit a rating and review
// @route   POST /api/ratings
// @access  Private (User only)
router.post(
  "/",
  [
    body("bookingId").isMongoId().withMessage("Invalid booking ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("review").optional().trim().isLength({ max: 1000 }).withMessage("Review must be less than 1000 characters"),
    body("serviceQuality").optional().isInt({ min: 1, max: 5 }).withMessage("Service quality must be between 1 and 5"),
    body("communication").optional().isInt({ min: 1, max: 5 }).withMessage("Communication must be between 1 and 5"),
    body("timeliness").optional().isInt({ min: 1, max: 5 }).withMessage("Timeliness must be between 1 and 5"),
    body("professionalism").optional().isInt({ min: 1, max: 5 }).withMessage("Professionalism must be between 1 and 5"),
    body("wouldRecommend").optional().isBoolean().withMessage("Would recommend must be true or false"),
  ],
  authMiddleware,
  roleMiddleware(["user"]),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { bookingId, rating, review, serviceQuality, communication, timeliness, professionalism, wouldRecommend } =
        req.body

      // Check if booking exists and belongs to user
      const booking = await Booking.findById(bookingId).populate("mechanic")
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" })
      }

      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" })
      }

      if (booking.status !== "completed") {
        return res.status(400).json({ message: "Can only rate completed bookings" })
      }

      // Check if rating already exists
      const existingRating = await Rating.findOne({ booking: bookingId })
      if (existingRating) {
        return res.status(400).json({ message: "Rating already submitted for this booking" })
      }

      // Create rating
      const newRating = await Rating.create({
        booking: bookingId,
        user: req.user._id,
        mechanic: booking.mechanic._id,
        rating,
        review: review || "",
        serviceQuality: serviceQuality || rating,
        communication: communication || rating,
        timeliness: timeliness || rating,
        professionalism: professionalism || rating,
        wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      })

      // Update mechanic's overall rating
      const ratingStats = await Rating.calculateMechanicRating(booking.mechanic._id)
      await Mechanic.findByIdAndUpdate(booking.mechanic._id, {
        rating: ratingStats.averageRating,
        totalRatings: ratingStats.totalRatings,
      })

      // Update booking with rating reference
      await Booking.findByIdAndUpdate(bookingId, {
        rating: rating,
        review: review || "",
      })

      await newRating.populate([
        { path: "user", select: "name profileImage" },
        { path: "mechanic", select: "name" },
        { path: "booking", select: "issueDescription locationName completedAt" },
      ])

      res.status(201).json({
        message: "Rating submitted successfully",
        rating: newRating,
      })
    } catch (error) {
      console.error("Submit rating error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Get ratings for a mechanic
// @route   GET /api/ratings/mechanic/:mechanicId
// @access  Public
router.get(
  "/mechanic/:mechanicId",
  [param("mechanicId").isMongoId().withMessage("Invalid mechanic ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { mechanicId } = req.params
      const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query

      const skip = (page - 1) * limit
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 }

      const ratings = await Rating.find({ mechanic: mechanicId })
        .populate("user", "name profileImage")
        .populate("booking", "issueDescription locationName completedAt")
        .sort(sort)
        .skip(skip)
        .limit(Number.parseInt(limit))

      const totalRatings = await Rating.countDocuments({ mechanic: mechanicId })
      const ratingStats = await Rating.calculateMechanicRating(mechanicId)

      res.json({
        ratings,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(totalRatings / limit),
          totalRatings,
          hasNext: page * limit < totalRatings,
          hasPrev: page > 1,
        },
        stats: ratingStats,
      })
    } catch (error) {
      console.error("Get mechanic ratings error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Get rating statistics for a mechanic
// @route   GET /api/ratings/mechanic/:mechanicId/stats
// @access  Public
router.get(
  "/mechanic/:mechanicId/stats",
  [param("mechanicId").isMongoId().withMessage("Invalid mechanic ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { mechanicId } = req.params
      const stats = await Rating.calculateMechanicRating(mechanicId)

      res.json(stats)
    } catch (error) {
      console.error("Get rating stats error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Get user's ratings
// @route   GET /api/ratings/user
// @access  Private (User only)
router.get("/user", authMiddleware, roleMiddleware(["user"]), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const ratings = await Rating.find({ user: req.user._id })
      .populate("mechanic", "name profileImage specialization")
      .populate("booking", "issueDescription locationName completedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalRatings = await Rating.countDocuments({ user: req.user._id })

    res.json({
      ratings,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
        hasNext: page * limit < totalRatings,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get user ratings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Mechanic respond to a rating
// @route   PUT /api/ratings/:ratingId/respond
// @access  Private (Mechanic only)
router.put(
  "/:ratingId/respond",
  [
    param("ratingId").isMongoId().withMessage("Invalid rating ID"),
    body("response").trim().isLength({ min: 1, max: 500 }).withMessage("Response must be between 1 and 500 characters"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { ratingId } = req.params
      const { response } = req.body

      const rating = await Rating.findById(ratingId)
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" })
      }

      if (rating.mechanic.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" })
      }

      if (rating.mechanicResponse) {
        return res.status(400).json({ message: "Response already submitted" })
      }

      rating.mechanicResponse = response
      rating.mechanicResponseDate = new Date()
      await rating.save()

      await rating.populate([
        { path: "user", select: "name profileImage" },
        { path: "booking", select: "issueDescription locationName completedAt" },
      ])

      res.json({
        message: "Response submitted successfully",
        rating,
      })
    } catch (error) {
      console.error("Respond to rating error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Mark rating as helpful
// @route   PUT /api/ratings/:ratingId/helpful
// @access  Private
router.put(
  "/:ratingId/helpful",
  [param("ratingId").isMongoId().withMessage("Invalid rating ID")],
  authMiddleware,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { ratingId } = req.params

      const rating = await Rating.findById(ratingId)
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" })
      }

      rating.isHelpful += 1
      await rating.save()

      res.json({
        message: "Rating marked as helpful",
        helpfulCount: rating.isHelpful,
      })
    } catch (error) {
      console.error("Mark rating helpful error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
