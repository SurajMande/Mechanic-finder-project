"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, MapPin, Clock, User, Phone, Star, Navigation } from "lucide-react"
import Navbar from "../components/Navbar"
import RealTimeTracker from "../components/RealTimeTracker"
import { locationUtils } from "../utils/locationUtils"
import toast from "react-hot-toast"

const TrackMechanic = () => {
  const { requestId } = useParams()
  const [request, setRequest] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRequestStatus = useCallback(async () => {
    try {
      const response = await axios.get(`/request/status/${requestId}`)
      setRequest(response.data.request)
    } catch (error) {
      toast.error("Failed to fetch request status")
      console.error("Request status error:", error)
    } finally {
      setLoading(false)
    }
  }, [requestId])

  const getCurrentLocation = useCallback(async () => {
    try {
      const position = await locationUtils.getCurrentPosition()
      setUserLocation(position)
    } catch (error) {
      console.error("Location error:", error)
      // Use request location as fallback
      if (request?.location) {
        setUserLocation(request.location)
      }
    }
  }, [request?.location])

  useEffect(() => {
    fetchRequestStatus()
    getCurrentLocation()
  }, [fetchRequestStatus, getCurrentLocation])

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading request details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Request Not Found</h3>
            <p className="text-slate-600 mb-6">The tracking information for this request is not available.</p>
            <Link to="/user/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/user/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Track Your Mechanic</h1>
            <p className="text-slate-600">Real-time location and status updates</p>
          </div>
        </div>

        {/* Request Status */}
        <div className="card-elevated mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Request Status</h2>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Created {formatDate(request.createdAt)}</span>
                </div>
                {request.acceptedAt && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Accepted {formatDate(request.acceptedAt)}</span>
                  </div>
                )}
              </div>
            </div>
            <span className={`status-badge ${getStatusColor(request.status)} px-4 py-2 rounded-full font-medium`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Issue Description</h3>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{request.issueDescription}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Service Location</h3>
              <div className="flex items-center text-slate-700 bg-slate-50 p-4 rounded-xl">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                <span>{request.locationName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mechanic Info */}
        {request.mechanic && (
          <div className="card-elevated mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Mechanic</h2>
            <div className="flex items-center space-x-4">
              {request.mechanic.profileImage ? (
                <img
                  src={request.mechanic.profileImage || "/placeholder.svg"}
                  alt={request.mechanic.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-slate-100">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{request.mechanic.name}</h3>
                <p className="text-blue-600 font-medium">{request.mechanic.specialization}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-amber-400" />
                    <span>{request.mechanic.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  <span>{request.mechanic.experience} years experience</span>
                  <span>{request.mechanic.completedJobs || 0} jobs completed</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <a
                  href={`tel:${request.mechanic.phone}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </a>
                <Link
                  to={`/mechanic/portfolio/${request.mechanic._id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Tracking */}
        {request.status === "accepted" && request.mechanic && userLocation && (
          <div className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              Live Tracking
            </h2>
            <RealTimeTracker requestId={requestId} mechanicInfo={request.mechanic} userLocation={userLocation} />
          </div>
        )}

        {/* Status Messages */}
        {request.status === "pending" && (
          <div className="card bg-amber-50 border-amber-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium text-amber-900">Waiting for Mechanic</h3>
                <p className="text-sm text-amber-700">
                  Your request has been sent to nearby mechanics. You'll be notified when someone accepts it.
                </p>
              </div>
            </div>
          </div>
        )}

        {request.status === "completed" && (
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <h3 className="font-medium text-green-900">Service Completed!</h3>
                <p className="text-sm text-green-700">
                  Your vehicle service has been completed successfully. Thank you for using MechanicFinder!
                </p>
              </div>
            </div>
          </div>
        )}

        {request.status === "cancelled" && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <h3 className="font-medium text-red-900">Request Cancelled</h3>
                <p className="text-sm text-red-700">
                  This service request has been cancelled. You can create a new request anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackMechanic
