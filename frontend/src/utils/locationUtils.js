// Location utilities for handling coordinates and address conversion
export const locationUtils = {
  // Get current position with high accuracy
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this environment"))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (error) => {
          let message = "Unable to retrieve location"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Location access denied by user"
              break

            case error.POSITION_UNAVAILABLE:
              message = "Location information unavailable"
              break

            case error.TIMEOUT:
              message = "Location request timed out"
              break

            default:
              message = "An unknown geolocation error occurred"
          }

          reject(new Error(message))
        },
        options,
      )
    })
  },

  // Convert coordinates to human-readable address
  getAddressFromCoords: async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      )

      if (!response.ok) {
        throw new Error("Geocoding service unavailable")
      }

      const data = await response.json()

      if (data?.error) {
        throw new Error("Address not found")
      }

      const address = data.address || {}
      const components = []

      if (address.house_number && address.road) {
        components.push(`${address.house_number} ${address.road}`)
      } else if (address.road) {
        components.push(address.road)
      }

      if (address.neighbourhood || address.suburb || address.residential) {
        components.push(address.neighbourhood || address.suburb || address.residential)
      }

      if (address.city || address.town || address.village) {
        components.push(address.city || address.town || address.village)
      }

      if (address.state) {
        components.push(address.state)
      }

      if (address.country) {
        components.push(address.country)
      }

      return components.length > 0
        ? components.join(", ")
        : "Location not found"
    } catch (error) {
      console.error("Geocoding error:", error)
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    }
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  // Format distance for display
  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  },

  // Watch position for real-time tracking
  watchPosition: (callback, errorCallback) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      errorCallback?.(new Error("Geolocation not supported"))
      return null
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000,
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback?.({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        errorCallback?.(error)
      },
      options,
    )
  },

  // Stop watching position
  clearWatch: (watchId) => {
    if (watchId && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  },
}