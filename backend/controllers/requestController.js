const Request = require("../models/Request")
const Booking = require("../models/Booking")
const User = require("../models/User")
const Mechanic = require("../models/Mechanic")
const { validationResult } = require("express-validator")

// @desc    Create a new service request
// @route   POST /api/request/create
// @access  Private (User only)
const createRequest = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() })
    }

    const { issueDescription, location, locationName, issueImage, priority = "medium" } = req.body

    // Create request
    const request = await Request.create({
      user: req.user._id,
      issueDescription,
      location: {
        latitude: Number.parseFloat(location.latitude),
        longitude: Number.parseFloat(location.longitude),
      },
      locationName,
      issueImage: issueImage || "",
      priority,
      status: "pending",
    })

    // Populate user details
    await request.populate("user", "name email phone profileImage")

    // Broadcast to all available mechanics via Socket.IO
    const io = req.app.get("io")
    io.to("mechanics").emit("new-request", request)

    res.status(201).json({
      message: "Request created successfully",
      ...request.toObject(),
    })
  } catch (error) {
    console.error("Create request error:", error)
    res.status(500).json({ message: "Server error while creating request" })
  }
}

// @desc    Get pending requests for mechanics
// @route   GET /api/request/broadcast
// @access  Private (Mechanic only)
const getBroadcastRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      status: "pending",
    })
      .populate("user", "name email phone profileImage")
      .sort({ createdAt: -1 })
      .limit(20)

    res.json(requests)
  } catch (error) {
    console.error("Get broadcast requests error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Mechanic responds to a request (accept/reject)
// @route   POST /api/request/respond
// @access  Private (Mechanic only)
const respondToRequest = async (req, res) => {
  try {
    const { requestId, response } = req.body

    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({ message: "Invalid response. Must be 'accepted' or 'rejected'" })
    }

    const request = await Request.findById(requestId).populate("user", "name email phone profileImage")

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer available" })
    }

    // Check if mechanic is available
    const mechanic = await Mechanic.findById(req.user._id)
    if (!mechanic.isAvailable && response === "accepted") {
      return res.status(400).json({ message: "You are currently unavailable" })
    }

    if (response === "accepted") {
      // Accept the request
      request.status = "accepted"
      request.mechanic = req.user._id
      request.acceptedAt = new Date()

      // Make mechanic unavailable for new requests
      mechanic.isAvailable = false
      await mechanic.save()

      await request.save()
      await request.populate("mechanic", "name email phone profileImage specialization experience")

      // Notify user via Socket.IO
      const io = req.app.get("io")
      io.to(`tracking-${requestId}`).emit("status-update", request)

      res.json({
        message: "Request accepted successfully",
        request,
      })
    } else {
      // Reject the request (just remove from mechanic's view, don't change status)
      res.json({
        message: "Request rejected",
      })
    }
  } catch (error) {
    console.error("Respond to request error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get request status and mechanic location for user
// @route   GET /api/request/status/:requestId
// @access  Private (User only)
const getRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params

    const request = await Request.findById(requestId)
      .populate("user", "name email phone profileImage")
      .populate("mechanic", "name email phone profileImage specialization experience currentLocation")

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    // Check if user owns this request
    if (request.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    let mechanicLocation = null
    if (request.mechanic && request.mechanic.currentLocation) {
      mechanicLocation = request.mechanic.currentLocation
    }

    res.json({
      request,
      mechanicLocation,
    })
  } catch (error) {
    console.error("Get request status error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update request status (in-progress, completed)
// @route   PUT /api/request/:requestId/status
// @access  Private (Mechanic only)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params
    const { status, notes, actualCost } = req.body

    if (!["in-progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const request = await Request.findById(requestId)
      .populate("user", "name email phone profileImage")
      .populate("mechanic", "name email phone profileImage specialization experience")

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    // Check if mechanic owns this request
    if (request.mechanic._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    request.status = status
    if (notes) request.notes = notes
    if (actualCost) request.actualCost = Number.parseFloat(actualCost)

    if (status === "completed") {
      request.completedAt = new Date()

      // Create booking record
      await Booking.create({
        request: request._id,
        user: request.user._id,
        mechanic: request.mechanic._id,
        issueDescription: request.issueDescription,
        locationName: request.locationName,
        status: "completed",
        cost: request.actualCost || 0,
        completedAt: new Date(),
      })

      // Update mechanic stats and make available again
      const mechanic = await Mechanic.findById(req.user._id)
      mechanic.completedJobs += 1
      mechanic.isAvailable = true
      await mechanic.save()
    }

    await request.save()

    // Notify user via Socket.IO
    const io = req.app.get("io")
    io.to(`tracking-${requestId}`).emit("status-update", request)

    res.json({
      message: `Request ${status} successfully`,
      request,
    })
  } catch (error) {
    console.error("Update request status error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get user's requests
// @route   GET /api/request/user-requests
// @access  Private (User only)
const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .populate("mechanic", "name email phone profileImage specialization experience")
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    console.error("Get user requests error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get mechanic's accepted requests
// @route   GET /api/request/mechanic-requests
// @access  Private (Mechanic only)
const getMechanicRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      mechanic: req.user._id,
      status: { $in: ["accepted", "in-progress", "completed"] },
    })
      .populate("user", "name email phone profileImage")
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    console.error("Get mechanic requests error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Cancel request
// @route   PUT /api/request/:requestId/cancel
// @access  Private (User only)
const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params

    const request = await Request.findById(requestId)

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    // Check if user owns this request
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (!["pending", "accepted"].includes(request.status)) {
      return res.status(400).json({ message: "Cannot cancel request in current status" })
    }

    request.status = "cancelled"
    await request.save()

    // If request was accepted, make mechanic available again
    if (request.mechanic) {
      await Mechanic.findByIdAndUpdate(request.mechanic, { isAvailable: true })
    }

    res.json({
      message: "Request cancelled successfully",
      request,
    })
  } catch (error) {
    console.error("Cancel request error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  createRequest,
  getBroadcastRequests,
  respondToRequest,
  getRequestStatus,
  updateRequestStatus,
  getUserRequests,
  getMechanicRequests,
  cancelRequest,
}
