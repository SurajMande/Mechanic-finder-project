const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mechanic",
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "cancelled"],
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index for user and mechanic queries
bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ mechanic: 1, createdAt: -1 })

module.exports = mongoose.model("Booking", bookingSchema)
