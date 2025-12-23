const MechanicPortfolio = require("../models/MechanicPortfolio")
const Mechanic = require("../models/Mechanic")
const { validationResult } = require("express-validator")

// @desc    Get mechanic's portfolio
// @route   GET /api/portfolio
// @access  Private (Mechanic only)
const getPortfolio = async (req, res) => {
  try {
    let portfolio = await MechanicPortfolio.findOne({ mechanic: req.user._id }).populate(
      "mechanic",
      "name email phone specialization experience rating totalRatings completedJobs profileImage",
    )

    if (!portfolio) {
      // Create default portfolio if doesn't exist
      portfolio = await MechanicPortfolio.create({
        mechanic: req.user._id,
        bio: "",
        services: [],
        certifications: [],
        workImages: [],
        availability: {
          monday: { start: "09:00", end: "18:00", available: true },
          tuesday: { start: "09:00", end: "18:00", available: true },
          wednesday: { start: "09:00", end: "18:00", available: true },
          thursday: { start: "09:00", end: "18:00", available: true },
          friday: { start: "09:00", end: "18:00", available: true },
          saturday: { start: "09:00", end: "16:00", available: true },
          sunday: { start: "", end: "", available: false },
        },
        serviceAreas: [],
        tools: [],
        achievements: [],
        socialLinks: {},
        isPublic: true,
      })

      await portfolio.populate(
        "mechanic",
        "name email phone specialization experience rating totalRatings completedJobs profileImage",
      )
    }

    res.json(portfolio)
  } catch (error) {
    console.error("Get portfolio error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get public portfolio
// @route   GET /api/portfolio/:mechanicId
// @access  Public
const getPublicPortfolio = async (req, res) => {
  try {
    const { mechanicId } = req.params

    const portfolio = await MechanicPortfolio.findOne({
      mechanic: mechanicId,
      isPublic: true,
    }).populate("mechanic", "name specialization experience rating totalRatings completedJobs profileImage")

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found or not public" })
    }

    // Increment view count
    portfolio.views += 1
    await portfolio.save()

    res.json(portfolio)
  } catch (error) {
    console.error("Get public portfolio error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update portfolio
// @route   PUT /api/portfolio
// @access  Private (Mechanic only)
const updatePortfolio = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() })
    }

    const updateData = req.body

    let portfolio = await MechanicPortfolio.findOne({ mechanic: req.user._id })

    if (!portfolio) {
      portfolio = await MechanicPortfolio.create({
        mechanic: req.user._id,
        ...updateData,
      })
    } else {
      Object.keys(updateData).forEach((key) => {
        portfolio[key] = updateData[key]
      })
      await portfolio.save()
    }

    await portfolio.populate(
      "mechanic",
      "name email phone specialization experience rating totalRatings completedJobs profileImage",
    )

    res.json({
      message: "Portfolio updated successfully",
      portfolio,
    })
  } catch (error) {
    console.error("Update portfolio error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Add work image
// @route   POST /api/portfolio/work-images
// @access  Private (Mechanic only)
const addWorkImage = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() })
    }

    const { url, description, beforeImage, afterImage } = req.body

    let portfolio = await MechanicPortfolio.findOne({ mechanic: req.user._id })

    if (!portfolio) {
      portfolio = await MechanicPortfolio.create({ mechanic: req.user._id })
    }

    portfolio.workImages.push({
      url,
      description,
      beforeImage,
      afterImage,
    })

    await portfolio.save()

    res.json({
      message: "Work image added successfully",
      workImage: portfolio.workImages[portfolio.workImages.length - 1],
    })
  } catch (error) {
    console.error("Add work image error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Remove work image
// @route   DELETE /api/portfolio/work-images/:imageId
// @access  Private (Mechanic only)
const removeWorkImage = async (req, res) => {
  try {
    const { imageId } = req.params

    const portfolio = await MechanicPortfolio.findOne({ mechanic: req.user._id })

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" })
    }

    portfolio.workImages = portfolio.workImages.filter((img) => img._id.toString() !== imageId)
    await portfolio.save()

    res.json({ message: "Work image removed successfully" })
  } catch (error) {
    console.error("Remove work image error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Add certification
// @route   POST /api/portfolio/certifications
// @access  Private (Mechanic only)
const addCertification = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() })
    }

    const { name, issuer, dateObtained, expiryDate, certificateImage } = req.body

    let portfolio = await MechanicPortfolio.findOne({ mechanic: req.user._id })

    if (!portfolio) {
      portfolio = await MechanicPortfolio.create({ mechanic: req.user._id })
    }

    portfolio.certifications.push({
      name,
      issuer,
      dateObtained,
      expiryDate,
      certificateImage,
    })

    await portfolio.save()

    res.json({
      message: "Certification added successfully",
      certification: portfolio.certifications[portfolio.certifications.length - 1],
    })
  } catch (error) {
    console.error("Add certification error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update certification
// @route   PUT /api/portfolio/certifications/:certId
// @access  Private (Mechanic only)
const updateCertification = async (req, res) => {
  try {
    const { certId } = req.params
    const updateData = req.body

    const portfolio = await MechanicPortfolio.findOne({ mechanic: req.user._id })

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" })
    }

    const certification = portfolio.certifications.id(certId)
    if (!certification) {
      return res.status(404).json({ message: "Certification not found" })
    }

    Object.keys(updateData).forEach((key) => {
      certification[key] = updateData[key]
    })

    await portfolio.save()

    res.json({
      message: "Certification updated successfully",
      certification,
    })
  } catch (error) {
    console.error("Update certification error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Remove certification
// @route   DELETE /api/portfolio/certifications/:certId
// @access  Private (Mechanic only)
const removeCertification = async (req, res) => {
  try {
    const { certId } = req.params

    const portfolio = await MechanicPortfolio.findOne({ mechanic: req.user._id })

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" })
    }

    portfolio.certifications = portfolio.certifications.filter((cert) => cert._id.toString() !== certId)
    await portfolio.save()

    res.json({ message: "Certification removed successfully" })
  } catch (error) {
    console.error("Remove certification error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getPortfolio,
  updatePortfolio,
  getPublicPortfolio,
  addWorkImage,
  removeWorkImage,
  addCertification,
  updateCertification,
  removeCertification,
}
