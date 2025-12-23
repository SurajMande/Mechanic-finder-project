import axios from "axios"
import config from "../config"
import { compressImage, validateImage } from "./imageUtils"

/* =========================
   AXIOS SETUP
   ========================= */

// Set base URL
axios.defaults.baseURL = config.API_URL

// Add token to every request
axios.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem("token")
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`
  }
  return reqConfig
})

/* =========================
   AUTH UTILITIES
   ========================= */

export const auth = {
  // Get current user from token (fallback)
  getCurrentUser: () => {
    const name = localStorage.getItem("name")
    
  if (name) return name

  // 2️⃣ Fallback to JWT
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload?.name || null
  } catch {
    return null
  }
  },

  // Check authentication
  isAuthenticated: () => {
    const token = localStorage.getItem("token")
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp > Date.now() / 1000
    } catch {
      return false
    }
  },

  // Login
  login: async (email, password) => {
    const response = await axios.post("/auth/login", { email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("name", user.name) // ✅ SAVE NAME
    localStorage.setItem("role", user.role)

    return user
  },

  // Register user
  registerUser: async (userData) => {
    const response = await axios.post("/user/register", userData)
    const { token, user } = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("name", user.name) // ✅ SAVE NAME
    localStorage.setItem("role", user.role)

    return user
  },

  // Register mechanic
  registerMechanic: async (mechanicData) => {
    const response = await axios.post("/mechanic/register", mechanicData)
    const { token, mechanic } = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("name", mechanic.name) // ✅ SAVE NAME
    localStorage.setItem("role", mechanic.role)

    return mechanic
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("name")
    localStorage.removeItem("role")
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem("role")
  },

  // Get user name (FAST)
  getUserName: () => {
    return localStorage.getItem("name")
  },
}

/* =========================
   LOCATION UTILITIES
   ========================= */

export const locationUtils = {
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    })
  },

  getAddressFromCoords: async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.REACT_APP_OPENCAGE_API_KEY}`
      )
      const data = await response.json()

      if (data.results?.length) {
        return data.results[0].formatted
      }

      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    } catch {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }
  },
}

/* =========================
   IMAGE UPLOAD (CLOUDINARY)
   ========================= */

export const uploadImage = async (file, options = {}) => {
  const {
    compress = true,
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85,
  } = options

  // Validate
  const validationErrors = validateImage(file)
  if (validationErrors.length) {
    throw new Error(validationErrors[0])
  }

  let processedFile = file

  // Compress
  if (compress) {
    try {
      processedFile = await compressImage(file, maxWidth, maxHeight, quality)
    } catch (err) {
      console.warn("Compression failed, using original file", err)
    }
  }

  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_UPLOAD_PRESET) {
    console.warn("⚠️ Cloudinary environment variables missing")
  }

  const formData = new FormData()
  formData.append("file", processedFile)
  formData.append("upload_preset", config.CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error("Image upload failed")
  }

  const data = await response.json()
  return data.secure_url
}
