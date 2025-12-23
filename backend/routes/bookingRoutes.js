const express = require("express")
const { body } = require("express-validator")
const authMiddleware = require("../middlewares/authMiddleware")
const Booking = require("../models/Booking")

const router = express.Router()

// @desc    Get booking history
// @route   GET /api/bookings/history
// @access  Private
router.get("/history", authMiddleware, async (req, res) => {
  try {
    let bookings

    if (req.user.role === "mechanic") {
      bookings = await Booking.find({ mechanic: req.user._id })
        .populate("user", "name email phone profileImage")
        .sort({ createdAt: -1 })
    } else {
      bookings = await Booking.find({ user: req.user._id })
        .populate("mechanic", "name email phone profileImage specialization experience")
        .sort({ createdAt: -1 })
    }

    res.json(bookings)
  } catch (error) {
    console.error("Get booking history error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Rate and review a completed booking
// @route   PUT /api/bookings/:bookingId/review
// @access  Private (User only)
router.put(
  "/:bookingId/review",
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("review").optional().trim().isLength({ max: 500 }).withMessage("Review must be less than 500 characters"),
  ],
  authMiddleware,
  async (req, res) => {
    try {
      const { bookingId } = req.params
      const { rating, review } = req.body

      const booking = await Booking.findById(bookingId)

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" })
      }

      // Check if user owns this booking
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" })
      }

      if (booking.status !== "completed") {
        return res.status(400).json({ message: "Can only review completed bookings" })
      }

      // Update booking with rating and review
      booking.rating = rating
      booking.review = review || ""
      await booking.save()

      // Update mechanic's overall rating
      const Mechanic = require("../models/Mechanic")
      const mechanic = await Mechanic.findById(booking.mechanic)

      if (mechanic) {
        const totalRating = mechanic.rating * mechanic.totalRatings + rating
        mechanic.totalRatings += 1
        mechanic.rating = totalRating / mechanic.totalRatings
        await mechanic.save()
      }

      res.json({
        message: "Review submitted successfully",
        booking,
      })
    } catch (error) {
      console.error("Submit review error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Get booking details
// @route   GET /api/bookings/:bookingId
// @access  Private
router.get("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params

    const booking = await Booking.findById(bookingId)
      .populate("user", "name email phone profileImage")
      .populate("mechanic", "name email phone profileImage specialization experience")
      .populate("request")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user has access to this booking
    const hasAccess =
      booking.user._id.toString() === req.user._id.toString() ||
      booking.mechanic._id.toString() === req.user._id.toString()

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(booking)
  } catch (error) {
    console.error("Get booking details error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
