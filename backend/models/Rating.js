const mongoose = require("mongoose")

const ratingSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    serviceQuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    timeliness: {
      type: Number,
      min: 1,
      max: 5,
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
    },
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    mechanicResponse: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    mechanicResponseDate: {
      type: Date,
    },
    isHelpful: {
      type: Number,
      default: 0,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
ratingSchema.index({ mechanic: 1, createdAt: -1 })
ratingSchema.index({ user: 1, createdAt: -1 })
ratingSchema.index({ booking: 1 })
ratingSchema.index({ rating: -1 })

// Calculate average rating for mechanic
ratingSchema.statics.calculateMechanicRating = async function (mechanicId) {
  const stats = await this.aggregate([
    { $match: { mechanic: mechanicId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        averageServiceQuality: { $avg: "$serviceQuality" },
        averageCommunication: { $avg: "$communication" },
        averageTimeliness: { $avg: "$timeliness" },
        averageProfessionalism: { $avg: "$professionalism" },
        recommendationRate: {
          $avg: { $cond: [{ $eq: ["$wouldRecommend", true] }, 1, 0] },
        },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ])

  if (stats.length > 0) {
    const result = stats[0]

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    result.ratingDistribution.forEach((rating) => {
      distribution[rating] = (distribution[rating] || 0) + 1
    })

    return {
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalRatings: result.totalRatings,
      averageServiceQuality: Math.round(result.averageServiceQuality * 10) / 10,
      averageCommunication: Math.round(result.averageCommunication * 10) / 10,
      averageTimeliness: Math.round(result.averageTimeliness * 10) / 10,
      averageProfessionalism: Math.round(result.averageProfessionalism * 10) / 10,
      recommendationRate: Math.round(result.recommendationRate * 100),
      ratingDistribution: distribution,
    }
  }

  return {
    averageRating: 0,
    totalRatings: 0,
    averageServiceQuality: 0,
    averageCommunication: 0,
    averageTimeliness: 0,
    averageProfessionalism: 0,
    recommendationRate: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  }
}

module.exports = mongoose.model("Rating", ratingSchema)
