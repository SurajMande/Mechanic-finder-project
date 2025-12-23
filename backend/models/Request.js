const mongoose = require("mongoose")

const requestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mechanic",
      default: null,
    },
    issueDescription: {
      type: String,
      required: true,
      trim: true,
    },
    issueImage: {
      type: String,
      default: "",
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    acceptedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Index for location-based queries
requestSchema.index({ location: "2dsphere" })

// Index for status and timestamps
requestSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model("Request", requestSchema)
