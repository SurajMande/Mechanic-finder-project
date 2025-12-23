const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const mechanicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      enum: ["Engine Repair", "Brake Service", "Transmission", "Electrical", "AC Repair", "General Maintenance"],
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    role: {
      type: String,
      default: "mechanic",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
mechanicSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
mechanicSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
mechanicSchema.methods.toJSON = function () {
  const mechanic = this.toObject()
  delete mechanic.password
  return mechanic
}

module.exports = mongoose.model("Mechanic", mechanicSchema)
