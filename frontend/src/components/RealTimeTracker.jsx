"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Clock, Phone, MessageCircle, AlertCircle } from "lucide-react"
import { locationUtils } from "../utils/locationUtils"
import { notificationUtils } from "../utils/notificationUtils"
import io from "socket.io-client"
import config from "../config"
import toast from "react-hot-toast"
import MapTracker from "./MapTracker"

const RealTimeTracker = ({ requestId, mechanicInfo, userLocation }) => {
  const [mechanicLocation, setMechanicLocation] = useState(null)
  const [distance, setDistance] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection with better error handling
    console.log(`🔌 Connecting to Socket.IO at: ${config.SOCKET_URL}`)
    
    const socket = io(config.SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
      withCredentials: true,
    })
    
    socketRef.current = socket

    // Connection established
    socket.on("connect", () => {
      setIsConnected(true)
      console.log("✅ Connected to tracking server, socket ID:", socket.id)
      
      // Join tracking room after connection
      socket.emit("join-tracking-room", requestId)
      console.log(`📍 Joined tracking room: tracking-${requestId}`)
    })

    // Connection error
    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message)
      toast.error(`Connection error: ${error.message}`)
    })

    // Disconnected
    socket.on("disconnect", (reason) => {
      setIsConnected(false)
      console.log("🔌 Disconnected from tracking server. Reason:", reason)
    })

    // Reconnecting
    socket.on("reconnecting", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`)
    })

    // Listen for location updates
    socket.on("location-update", (data) => {
      console.log("📍 Location update received:", data)
      setMechanicLocation(data.location)
      setLastUpdate(new Date(data.timestamp))

      // Calculate distance and ETA
      if (userLocation && data.location) {
        const dist = locationUtils.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          data.location.latitude,
          data.location.longitude,
        )
        setDistance(dist)

        // Estimate time (assuming average speed of 30 km/h in city)
        const eta = Math.round((dist / 30) * 60) // minutes
        setEstimatedTime(eta)

        // Show notification if distance is significant
        if (dist < 1 && mechanicInfo) {
          notificationUtils.showLocationUpdate(mechanicInfo.name, locationUtils.formatDistance(dist))
        }
      }
    })

    // Listen for status updates
    socket.on("status-update", (data) => {
      console.log("Status update received:", data)
      if (mechanicInfo && data.status) {
        notificationUtils.showStatusUpdate(data.status, mechanicInfo.name)
      }
    })

    // Listen for errors
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error)
      if (error.message) {
        toast.error(`Server error: ${error.message}`)
      }
    })

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (watchIdRef.current) {
        locationUtils.clearWatch(watchIdRef.current)
      }
    }
  }, [requestId, mechanicInfo, userLocation])

  // Start watching user's location for better tracking
  useEffect(() => {
    if (userLocation) {
      watchIdRef.current = locationUtils.watchPosition(
        (position) => {
          // Update user location if it changes significantly
          const dist = locationUtils.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            position.latitude,
            position.longitude,
          )

          if (dist > 0.1) {
            // 100 meters threshold
            // Could update user location here if needed
            console.log("User location changed:", position)
          }
        },
        (error) => {
          console.error("Location watch error:", error)
        },
      )
    }

    return () => {
      if (watchIdRef.current) {
        locationUtils.clearWatch(watchIdRef.current)
      }
    }
  }, [userLocation])

  const formatLastUpdate = () => {
    if (!lastUpdate) return "No updates yet"

    const now = new Date()
    const diffMs = now - lastUpdate
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins === 1) return "1 minute ago"
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "1 hour ago"
    return `${diffHours} hours ago`
  }

  const getConnectionStatus = () => {
    if (!isConnected) {
      return { text: "Connecting...", color: "text-amber-600", bg: "bg-amber-50" }
    }
    if (!mechanicLocation) {
      return { text: "Waiting for location...", color: "text-blue-600", bg: "bg-blue-50" }
    }
    return { text: "Live tracking", color: "text-green-600", bg: "bg-green-50" }
  }

  const status = getConnectionStatus()

  return (
    <div className="space-y-6">
      {/* Map Component */}
      {mechanicLocation && userLocation && (
        <MapTracker
          userLocation={userLocation}
          mechanicLocation={mechanicLocation}
          distance={distance}
          estimatedTime={estimatedTime}
          mechanicName={mechanicInfo?.name}
          isConnected={isConnected}
        />
      )}

      {/* Connection Status */}
      <div className={`flex items-center justify-between p-4 rounded-xl ${status.bg}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></div>
          <span className={`font-medium ${status.color}`}>{status.text}</span>
        </div>
        <span className="text-sm text-slate-600">Updated {formatLastUpdate()}</span>
      </div>

      {/* Location Info */}
      {mechanicLocation && (
        <div className="card-elevated">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Mechanic Location</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    Lat: {mechanicLocation.latitude.toFixed(6)}, Lng: {mechanicLocation.longitude.toFixed(6)}
                  </span>
                </div>
                {distance && (
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 mr-2" />
                    <span>{locationUtils.formatDistance(distance)} away</span>
                  </div>
                )}
                {estimatedTime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>ETA: {estimatedTime} minutes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              {mechanicInfo?.phone && (
                <a
                  href={`tel:${mechanicInfo.phone}`}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Call mechanic"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={() => {
                  // Could open a chat or messaging interface
                  toast.success("Messaging feature coming soon!")
                }}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                title="Message mechanic"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Distance Progress */}
          {distance && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Distance</span>
                <span className="font-medium text-slate-900">{locationUtils.formatDistance(distance)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(10, Math.min(100, (5 - distance) * 20))}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 text-center">
                {distance < 0.5 ? "Very close!" : distance < 1 ? "Almost there!" : "On the way"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mechanic Info */}
      {mechanicInfo && (
        <div className="card">
          <div className="flex items-center space-x-4">
            {mechanicInfo.profileImage ? (
              <img
                src={mechanicInfo.profileImage || "/placeholder.svg"}
                alt={mechanicInfo.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{mechanicInfo.name?.charAt(0) || "M"}</span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{mechanicInfo.name}</h4>
              <p className="text-sm text-slate-600">{mechanicInfo.specialization}</p>
              <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                <span>{mechanicInfo.experience} years exp.</span>
                <span>⭐ {mechanicInfo.rating?.toFixed(1) || "N/A"}</span>
                <span>{mechanicInfo.completedJobs || 0} jobs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Live Tracking Active</h4>
            <p className="text-sm text-blue-700">
              Your mechanic's location is being tracked in real-time. You'll receive notifications when they're nearby.
              Keep this page open for the most accurate updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeTracker
