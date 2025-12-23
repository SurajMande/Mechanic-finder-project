"use client"

import { useState, useEffect } from "react"
import { Power, Loader } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const AvailabilityToggle = ({ initialAvailability = false, onToggle }) => {
  const [isAvailable, setIsAvailable] = useState(initialAvailability)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsAvailable(initialAvailability)
  }, [initialAvailability])

  const handleToggle = async () => {
    setLoading(true)
    try {
      const response = await axios.put("/mechanic/availability")
      const newAvailability = response.data.isAvailable

      setIsAvailable(newAvailability)

      // Call parent callback if provided
      if (onToggle) {
        onToggle(newAvailability)
      }

      toast.success(newAvailability ? "🟢 You're now available for requests" : "🔴 You're now offline", {
        duration: 3000,
        style: {
          background: newAvailability ? "#10b981" : "#ef4444",
          color: "white",
          fontWeight: "600",
        },
      })
    } catch (error) {
      toast.error("Failed to update availability")
      console.error("Availability toggle error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
        <div>
          <h3 className="font-semibold text-slate-900">
            {isAvailable ? "Available for Requests" : "Currently Offline"}
          </h3>
          <p className="text-sm text-slate-600">
            {isAvailable ? "You'll receive new service requests" : "Turn on to start receiving requests"}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isAvailable ? "bg-green-500" : "bg-slate-300"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="sr-only">Toggle availability</span>
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center ${
            isAvailable ? "translate-x-7" : "translate-x-1"
          }`}
        >
          {loading ? (
            <Loader className="h-3 w-3 animate-spin text-slate-400" />
          ) : (
            <Power className={`h-3 w-3 ${isAvailable ? "text-green-500" : "text-slate-400"}`} />
          )}
        </span>
      </button>
    </div>
  )
}

export default AvailabilityToggle
