"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Camera, Send, Loader, X, AlertTriangle } from "lucide-react"
import { locationUtils, uploadImage } from "../utils/auth"
import Navbar from "../components/Navbar"
import toast from "react-hot-toast"

const RequestPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    issueDescription: "",
    location: {
      latitude: null,
      longitude: null,
    },
    locationName: "",
    issueImage: "",
    priority: "medium",
  })
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

 const getCurrentLocation = async () => {
  setLocationLoading(true)

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000,
      })
    })

    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    // 🔹 Reverse Geocoding (FREE)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    )

    const data = await res.json()

    const address =
      data.display_name ||
      `${data.address?.road || ""} ${data.address?.city || data.address?.town || ""}`.trim()

    setFormData((prev) => ({
      ...prev,
      location: { latitude, longitude }, // ✅ backend
      locationName: address,              // ✅ user-visible
    }))

    toast.success("📍 Location detected successfully")
  } catch (error) {
    toast.error("Unable to fetch address. Please enter location manually.")
  } finally {
    setLocationLoading(false)
  }
}



  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    setImageUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      setFormData((prev) => ({ ...prev, issueImage: imageUrl }))
      toast.success("📷 Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, issueImage: "" }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.location.latitude || !formData.location.longitude) {
      toast.error("Please provide your location")
      return
    }

    if (formData.issueDescription.length < 10) {
      toast.error("Please provide a more detailed description (at least 10 characters)")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("/request/create", formData)
      toast.success("🎉 Request submitted successfully!")
      navigate(`/track/${response.data._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request")
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "emergency":
        return "border-red-500 bg-red-50 text-red-700"
      case "high":
        return "border-orange-500 bg-orange-50 text-orange-700"
      case "medium":
        return "border-blue-500 bg-blue-50 text-blue-700"
      case "low":
        return "border-gray-500 bg-gray-50 text-gray-700"
      default:
        return "border-gray-300 bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Request a Mechanic</h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Describe your vehicle issue and get connected with trusted mechanics in your area
          </p>
        </div>

        <div className="card-elevated max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Issue Description */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Describe the Issue *</label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleInputChange}
                rows={4}
                className="input-field-large resize-none"
                placeholder="Please describe what's wrong with your vehicle in detail. Include symptoms, when it started, and any relevant information..."
                required
              />
              <p className="text-xs text-slate-500">
                {formData.issueDescription.length}/500 characters (minimum 10 required)
              </p>
            </div>

            {/* Priority Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Priority Level *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "low", label: "Low", icon: "🟢" },
                  { value: "medium", label: "Medium", icon: "🟡" },
                  { value: "high", label: "High", icon: "🟠" },
                  { value: "emergency", label: "Emergency", icon: "🔴" },
                ].map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: priority.value }))}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-center ${formData.priority === priority.value
                        ? getPriorityColor(priority.value)
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                  >
                    <div className="text-lg sm:text-xl mb-1">{priority.icon}</div>
                    <div className="text-xs sm:text-sm font-medium">{priority.label}</div>
                  </button>
                ))}
              </div>
              {formData.priority === "emergency" && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    Emergency requests are prioritized and may incur additional charges. Use only for urgent situations.
                  </p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Your Location *</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleInputChange}
                  className="input-field-large flex-1"
                  placeholder="Enter your location manually if needed..."
                />

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="btn-primary whitespace-nowrap"
                >
                  {locationLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Getting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Get Location</span>
                    </div>
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-600">
                📍 We need your location to find nearby mechanics and provide accurate service
              </p>
            </div>

            {/* Issue Image */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Upload Issue Photo (Optional)</label>

              {formData.issueImage ? (
                <div className="relative">
                  <img
                    src={formData.issueImage || "/placeholder.svg"}
                    alt="Issue"
                    className="w-full h-48 sm:h-64 object-cover rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                    📷 Issue Photo
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 hover:border-slate-400 transition-colors">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-semibold">Upload a photo</span>
                        <span className="text-slate-600"> or drag and drop</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                          disabled={imageUploading}
                        />
                      </label>
                      <p className="text-sm text-slate-500">PNG, JPG, GIF up to 5MB</p>
                      {imageUploading && (
                        <div className="flex items-center justify-center space-x-2 text-blue-600 mt-3">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Uploading image...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <p className="text-sm text-slate-600">
                📸 Adding a photo helps mechanics better understand your issue and provide accurate estimates
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/user/dashboard")}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading || locationLoading}
                className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Submit Request</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Need Help?</h3>
            <p className="text-slate-600 mb-4">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-slate-600">
              <div>📞 +1 (555) 123-4567</div>
              <div className="hidden sm:block">•</div>
              <div>📧 support@mechanicfinder.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestPage
