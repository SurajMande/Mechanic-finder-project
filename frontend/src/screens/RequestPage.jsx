import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Camera, Send, Loader, X } from "lucide-react"
import { uploadImage } from "../utils/auth"
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const getCurrentLocation = async () => {
    if (!navigator?.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

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

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )

      const data = await res.json()

      const address =
        data?.display_name ||
        `${data?.address?.road || ""} ${
          data?.address?.city || data?.address?.town || ""
        }`.trim()

      setFormData((prev) => ({
        ...prev,
        location: { latitude, longitude },
        locationName: address,
      }))

      toast.success("📍 Location detected successfully")
    } catch (error) {
      console.error(error)
      toast.error("Unable to fetch address. Please enter location manually.")
    } finally {
      setLocationLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
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
      console.error(error)
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
      console.error(error)
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
      <div className="max-w-2xl mx-auto p-6 sm:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Service Request</h1>
          <p className="text-slate-600 mb-6">Describe your vehicle issue and we'll connect you with the best mechanics</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Description *</label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleInputChange}
                placeholder="Describe the problem you're facing with your vehicle..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Minimum 10 characters</p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['low', 'medium', 'high', 'emergency'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority }))}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      formData.priority === priority
                        ? getPriorityColor(priority) + ' ring-2 ring-offset-2'
                        : 'border border-slate-300 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition"
              >
                <MapPin className="h-4 w-4" />
                {locationLoading ? 'Detecting location...' : 'Detect Current Location'}
              </button>
              {formData.locationName && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{formData.locationName}</p>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vehicle Image</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer">
                  <Camera className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    {imageUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                </label>
              </div>

              {formData.issueImage && (
                <div className="mt-4 relative">
                  <img
                    src={formData.issueImage}
                    alt="Issue preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 transition font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RequestPage