"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import io from "socket.io-client"
import { Bell, CheckCircle, Clock, Settings, AlertCircle, TrendingUp, Calendar } from "lucide-react"
import Navbar from "../components/Navbar"
import RequestCard from "../components/RequestCard"
import BookingHistory from "../components/BookingHistory"
import ProfileForm from "../components/ProfileForm"
import AvailabilityToggle from "../components/AvailabilityToggle"
import AdvancedSearchFilters from "../components/AdvancedSearchFilters"
import MechanicLocationSharer from "../components/MechanicLocationSharer"
import { notificationUtils } from "../utils/notificationUtils"
import config from "../config"
import toast from "react-hot-toast"

const MechanicDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests")
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [isOnline, setIsOnline] = useState(true)
  const [mechanicProfile, setMechanicProfile] = useState(null)
  const [activeRequests, setActiveRequests] = useState([])

  useEffect(() => {
    // Initialize notifications
    initializeNotifications()

    // Fetch mechanic profile
    fetchMechanicProfile()

    // Initialize socket connection
    const newSocket = io(config.SOCKET_URL)
    setSocket(newSocket)

    // Join mechanic room for real-time updates
    newSocket.emit("join-mechanic-room")

    // Listen for new requests
    newSocket.on("new-request", (request) => {
      setRequests((prev) => [request, ...prev])

      // Show notification
      notificationUtils.showServiceRequest(request)

      toast.success("🔔 New service request received!", {
        duration: 5000,
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          fontWeight: "600",
        },
      })
    })

    // Listen for request updates
    newSocket.on("request-updated", (updatedRequest) => {
      setRequests((prev) => prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req)))
      setActiveRequests((prev) => prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req)))
    })

    // Connection status
    newSocket.on("connect", () => setIsOnline(true))
    newSocket.on("disconnect", () => setIsOnline(false))

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests()
    } else if (activeTab === "active") {
      fetchActiveRequests()
    }
  }, [activeTab])

  const initializeNotifications = async () => {
    try {
      if (notificationUtils.isSupported()) {
        const granted = await notificationUtils.requestPermission()
        if (granted) {
          console.log("Notifications enabled")
        }
      }
    } catch (error) {
      console.error("Notification setup error:", error)
    }
  }

  const fetchMechanicProfile = async () => {
    try {
      const response = await axios.get("/mechanic/profile")
      setMechanicProfile(response.data)
    } catch (error) {
      console.error("Profile fetch error:", error)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/request/broadcast")
      setRequests(response.data)
    } catch (error) {
      toast.error("Failed to fetch requests")
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveRequests = async () => {
    try {
      const response = await axios.get("/request/mechanic-requests")
      setActiveRequests(response.data)
    } catch (error) {
      toast.error("Failed to fetch active requests")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post("/request/respond", {
        requestId,
        response: "accepted",
      })

      // Update local state
      setRequests((prev) => prev.map((req) => (req._id === requestId ? { ...req, status: "accepted" } : req)))

      // Add to active requests
      const acceptedRequest = requests.find((req) => req._id === requestId)
      if (acceptedRequest) {
        setActiveRequests((prev) => [{ ...acceptedRequest, status: "accepted" }, ...prev])
      }

      toast.success("🎉 Request accepted successfully!")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post("/request/respond", {
        requestId,
        response: "rejected",
      })

      // Remove from local state
      setRequests((prev) => prev.filter((req) => req._id !== requestId))

      toast.success("Request declined")
    } catch (error) {
      toast.error("Failed to decline request")
    }
  }

  const handleCompleteRequest = async (requestId) => {
    try {
      await axios.put(`/request/${requestId}/status`, {
        status: "completed",
        notes: "Service completed successfully",
      })

      // Update active requests
      setActiveRequests((prev) => prev.map((req) => (req._id === requestId ? { ...req, status: "completed" } : req)))

      toast.success("🎉 Request marked as completed!")
    } catch (error) {
      toast.error("Failed to complete request")
    }
  }

  const handleAvailabilityToggle = (isAvailable) => {
    setMechanicProfile((prev) => ({ ...prev, isAvailable }))

    // Emit availability change to other mechanics
    if (socket) {
      socket.emit("availability-toggle", {
        mechanicId: mechanicProfile?._id,
        isAvailable,
      })
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.locationName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    active: activeRequests.filter((r) => ["accepted", "in-progress"].includes(r.status)).length,
    completed: activeRequests.filter((r) => r.status === "completed").length,
    total: requests.length,
    highPriority: requests.filter((r) => ["high", "emergency"].includes(r.priority)).length,
  }

  const renderRequests = () => (
    <div className="space-y-6 sm:space-y-8 fade-in">
      {/* Availability Toggle */}
      <AvailabilityToggle
        initialAvailability={mechanicProfile?.isAvailable || false}
        onToggle={handleAvailabilityToggle}
      />

      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-16 translate-x-8 sm:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Service Requests</h1>
              <p className="text-indigo-100">Manage incoming requests and grow your business</p>
            </div>

            {/* Online Status */}
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                  isOnline ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
                <span className="text-sm font-medium">{isOnline ? "Online" : "Offline"}</span>
              </div>
              <Bell className="h-5 w-5 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.pending}</p>
              <p className="text-xs text-slate-500 mt-1">Awaiting response</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Active</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.active}</p>
              <p className="text-xs text-slate-500 mt-1">In progress</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.completed}</p>
              <p className="text-xs text-slate-500 mt-1">This period</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">High Priority</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.highPriority}</p>
              <p className="text-xs text-slate-500 mt-1">Urgent requests</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Available</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">All requests</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search Filters */}
      <AdvancedSearchFilters
        onFiltersChange={(filters) => {
          setSearchTerm(filters.searchTerm)
          setFilterPriority(filters.priority || "all")
        }}
      />

      {/* Requests List */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Available Requests</h2>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-6 border border-slate-200 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm || filterPriority !== "all" ? "No matching requests" : "No requests available"}
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {searchTerm || filterPriority !== "all"
                ? "Try adjusting your search or filter criteria to find more requests."
                : "New service requests will appear here in real-time. Make sure you're online to receive notifications."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request, index) => (
              <div key={request._id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <RequestCard
                  request={request}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  showActions={request.status === "pending"}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderActiveRequests = () => (
    <div className="space-y-6 sm:space-y-8 fade-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Active Jobs</h1>
          <p className="text-green-100">Manage your ongoing service requests</p>
        </div>
      </div>

      <div className="card-elevated">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-6">Current Jobs</h2>

        {activeRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Jobs</h3>
            <p className="text-slate-600">Accept requests to start working on them</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeRequests.map((request, index) => (
              <div key={request._id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="p-6 border border-slate-200 rounded-xl">
                  <RequestCard request={request} showActions={false} />

                  {/* Action Buttons for Active Requests */}
                  <div className="flex space-x-3 mt-6 pt-6 border-t border-slate-200">
                    {request.status === "accepted" && (
                      <button
                        onClick={() => handleCompleteRequest(request._id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Mark as Completed
                      </button>
                    )}

                    {request.status === "completed" && (
                      <div className="flex-1 bg-green-50 border border-green-200 text-green-800 font-semibold py-3 px-6 rounded-xl text-center">
                        ✅ Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      {/* Location Sharer - Active when mechanic has ongoing requests */}
      {activeRequests.length > 0 && (
        <MechanicLocationSharer
          requestId={activeRequests[0]._id}
          mechanicId={mechanicProfile?._id}
          isActive={
            activeRequests.length > 0 && 
            ["accepted", "in-progress"].includes(activeRequests[0]?.status)
          }
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "requests"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Bell className="inline h-4 w-4 mr-3" />
                  Service Requests
                  {stats.pending > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">{stats.pending}</span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("active")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "active"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle className="inline h-4 w-4 mr-3" />
                  Active Jobs
                  {stats.active > 0 && (
                    <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">{stats.active}</span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "history"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="inline h-4 w-4 mr-3" />
                  Job History
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "profile"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Settings className="inline h-4 w-4 mr-3" />
                  Profile Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "requests" && renderRequests()}
            {activeTab === "active" && renderActiveRequests()}
            {activeTab === "history" && <BookingHistory userRole="mechanic" />}
            {activeTab === "profile" && <ProfileForm userRole="mechanic" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MechanicDashboard
