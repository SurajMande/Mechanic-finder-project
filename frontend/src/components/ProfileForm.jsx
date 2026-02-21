"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Camera, Save, User, Mail, Phone, Briefcase, Clock, Upload, X, Check, Edit3 } from "lucide-react"
import { uploadImage } from "../utils/auth"
import toast from "react-hot-toast"

const ProfileForm = ({ userRole }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    // Mechanic specific fields
    specialization: "",
    experience: "",
    isAvailable: true,
  })
  const [originalProfile, setOriginalProfile] = useState({})
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const endpoint = userRole === "mechanic" ? "/mechanic/profile" : "/user/profile"
      const response = await axios.get(endpoint)
      setProfile(response.data)
      setOriginalProfile(response.data)
    } catch (error) {
      toast.error("Failed to fetch profile")
    }
  }, [userRole])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    // Check if there are any changes
    const changes = Object.keys(profile).some((key) => profile[key] !== originalProfile[key])
    setHasChanges(changes)
  }, [profile, originalProfile])



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageUploading(true)
    try {
      // Use optimized image upload with compression
      const imageUrl = await uploadImage(file, {
        compress: true,
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
      })
      setProfile((prev) => ({ ...prev, profileImage: imageUrl }))
      toast.success("📷 Image uploaded and optimized successfully")
    } catch (error) {
      toast.error(error.message || "Failed to upload image")
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = userRole === "mechanic" ? "/mechanic/profile" : "/user/profile"
      await axios.put(endpoint, profile)
      setOriginalProfile(profile)
      setIsEditing(false)
      toast.success("✅ Profile updated successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setProfile(originalProfile)
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleRemoveImage = () => {
    setProfile((prev) => ({ ...prev, profileImage: "" }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
        </div>

        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Profile Image Section */}
        <div className="card-elevated">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-6">Profile Photo</h2>

          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6">
            <div className="relative group mb-4 sm:mb-0">
              {profile.profileImage ? (
                <div className="relative">
                  <img
                    src={profile.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-slate-100"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ring-4 ring-slate-100">
                  <User className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400" />
                </div>
              )}

              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {profile.profileImage ? "Update Photo" : "Upload Photo"}
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Upload a professional photo. Images are automatically optimized. JPG, PNG or WebP. Max size 10MB.
              </p>

              {isEditing && (
                <label className="btn-secondary cursor-pointer inline-flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  {imageUploading ? "Optimizing..." : "Choose File"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </label>
              )}

              {imageUploading && (
                <div className="mt-3 flex items-center space-x-2 text-blue-600">
                  <div className="spinner"></div>
                  <span className="text-sm">Uploading and optimizing image...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card-elevated">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="input-field-large"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className="input-field-large"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="input-field-large"
                disabled={!isEditing}
                required
              />
            </div>

            {/* Mechanic specific fields */}
            {userRole === "mechanic" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleInputChange}
                    className="input-field-large"
                    disabled={!isEditing}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Electrical">Electrical</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="General Maintenance">General Maintenance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={profile.experience}
                    onChange={handleInputChange}
                    className="input-field-large"
                    min="0"
                    max="50"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={profile.isAvailable}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Available for new requests</span>
                      <p className="text-xs text-slate-500">Toggle your availability to receive new service requests</p>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
            <button type="button" onClick={handleCancel} className="btn-secondary w-full sm:w-auto" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading || !hasChanges}
              className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Save Indicator */}
        {!isEditing && !hasChanges && (
          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-xl">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">Profile is up to date</span>
          </div>
        )}
      </form>
    </div>
  )
}

export default ProfileForm
