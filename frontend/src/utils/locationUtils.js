// Location utilities for handling coordinates and address conversion
export const locationUtils = {
  // Get current position with high accuracy
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
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
      // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      )

      if (!response.ok) {
        throw new Error("Geocoding service unavailable")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error("Address not found")
      }

      // Format address components
      const address = data.address || {}
      const components = []

      // Add specific location details
      if (address.house_number && address.road) {
        components.push(`${address.house_number} ${address.road}`)
      } else if (address.road) {
        components.push(address.road)
      }

      // Add area/neighborhood
      if (address.neighbourhood || address.suburb || address.residential) {
        components.push(address.neighbourhood || address.suburb || address.residential)
      }

      // Add city
      if (address.city || address.town || address.village) {
        components.push(address.city || address.town || address.village)
      }

      // Add state
      if (address.state) {
        components.push(address.state)
      }

      // Add country
      if (address.country) {
        components.push(address.country)
      }

      return components.length > 0 ? components.join(", ") : "Location not found"
    } catch (error) {
      console.error("Geocoding error:", error)
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    }
  },

  // Calculate distance between two points
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
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
    if (!navigator.geolocation) {
      errorCallback(new Error("Geolocation not supported"))
      return null
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000, // 1 second cache for real-time tracking
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      errorCallback,
      options,
    )
  },

  // Stop watching position
  clearWatch: (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  },
}
