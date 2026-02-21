"use client"

import { useEffect, useRef } from "react"
import { locationUtils } from "../utils/locationUtils"
import io from "socket.io-client"
import config from "../config"

const MechanicLocationSharer = ({ requestId, mechanicId, isActive }) => {
  const socketRef = useRef(null)
  const watchIdRef = useRef(null)
  const lastEmitRef = useRef(null)
  const MIN_EMIT_INTERVAL = 5000 // Emit every 5 seconds max

  useEffect(() => {
    console.log(`🔍 [LocationSharer] Checking conditions - isActive: ${isActive}, requestId: ${requestId}, mechanicId: ${mechanicId}`)
    
    if (!isActive || !requestId || !mechanicId) {
      console.warn(`🚫 [LocationSharer] Inactive - isActive: ${isActive}, requestId: ${requestId}, mechanicId: ${mechanicId}`)
      // Stop sharing when not active
      if (watchIdRef.current) {
        console.log(`⛔ [LocationSharer] Cleaning up watch ID: ${watchIdRef.current}`)
        locationUtils.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    // Initialize socket connection for location sharing
    console.log(`🚗 [LocationSharer] Starting location sharing - Request: ${requestId}, Mechanic: ${mechanicId}`)
    const socket = io(config.SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("✅ Location sharer connected:", socket.id)
    })

    socket.on("error", (error) => {
      console.error("❌ Location sharer error:", error)
    })

    // Watch mechanic's location and emit updates
    watchIdRef.current = locationUtils.watchPosition(
      (position) => {
        const now = Date.now()
        
        // Throttle emissions to prevent overwhelming the server
        if (lastEmitRef.current && now - lastEmitRef.current < MIN_EMIT_INTERVAL) {
          console.log(`⏱️  [LocationSharer] Throttled - last emit was ${now - lastEmitRef.current}ms ago`)
          return
        }

        console.log(`📍 [LocationSharer] Location received: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`)
        
        // Emit location to backend
        socket.emit("update-location", {
          requestId,
          location: {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
          },
          mechanicId,
        })

        console.log(`📤 [LocationSharer] Emitted update for request ${requestId}`)
        lastEmitRef.current = now
      },
      (error) => {
        console.error("❌ Location watch error:", error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    )

    // Also emit initial location immediately
    locationUtils
      .getCurrentPosition()
      .then((position) => {
        console.log(`📍 [LocationSharer] Initial location: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`)
        socket.emit("update-location", {
          requestId,
          location: {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
          },
          mechanicId,
        })
        console.log(`📤 [LocationSharer] Emitted initial location for request ${requestId}`)
        lastEmitRef.current = Date.now()
      })
      .catch((error) => {
        console.error(`❌ [LocationSharer] Failed to get initial location: ${error.message}`)
      })

    // Cleanup
    return () => {
      if (watchIdRef.current) {
        locationUtils.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [isActive, requestId, mechanicId])

  // Component doesn't render anything
  return null
}

export default MechanicLocationSharer
