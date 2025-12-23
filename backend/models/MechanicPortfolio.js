const mongoose = require("mongoose")

const workImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  beforeImage: {
    type: String,
    default: "",
  },
  afterImage: {
    type: String,
    default: "",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  issuer: {
    type: String,
    required: true,
  },
  dateObtained: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
  },
  certificateImage: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
})

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  estimatedPrice: {
    type: Number,
    required: true,
  },
  estimatedDuration: {
    type: String, // e.g., "2-3 hours"
    required: true,
  },
  category: {
    type: String,
    enum: ["Engine Repair", "Brake Service", "Transmission", "Electrical", "AC Repair", "General Maintenance"],
    required: true,
  },
})

const availabilitySchema = new mongoose.Schema({
  monday: {
    start: String,
    end: String,
    available: { type: Boolean, default: true },
  },
  tuesday: {
    start: String,
    end: String,
    available: { type: Boolean, default: true },
  },
  wednesday: {
    start: String,
    end: String,
    available: { type: Boolean, default: true },
  },
  thursday: {
    start: String,
    end: String,
    available: { type: Boolean, default: true },
  },
  friday: {
    start: String,
    end: String,
    available: { type: Boolean, default: true },
  },
  saturday: {
    start: String,
    end: String,
    available: { type: Boolean, default: true },
  },
  sunday: {
    start: String,
    end: String,
    available: { type: Boolean, default: false },
  },
})

const mechanicPortfolioSchema = new mongoose.Schema(
  {
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mechanic",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    services: [serviceSchema],
    certifications: [certificationSchema],
    workImages: [workImageSchema],
    availability: {
      type: availabilitySchema,
      default: () => ({}),
    },
    serviceAreas: [
      {
        name: String,
        radius: Number, // in kilometers
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],
    tools: [
      {
        name: String,
        description: String,
        image: String,
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        dateAchieved: Date,
        icon: String,
      },
    ],
    socialLinks: {
      website: String,
      facebook: String,
      instagram: String,
      linkedin: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Update lastUpdated on save
mechanicPortfolioSchema.pre("save", function (next) {
  this.lastUpdated = new Date()
  next()
})

// Index for better query performance
mechanicPortfolioSchema.index({ mechanic: 1 })
mechanicPortfolioSchema.index({ isPublic: 1 })
mechanicPortfolioSchema.index({ "services.category": 1 })

module.exports = mongoose.model("MechanicPortfolio", mechanicPortfolioSchema)
