import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Camera, Send, Loader, X, AlertTriangle } from "lucide-react"
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
      {/* UI unchanged */}
    </div>
  )
}

export default RequestPage