"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Plus, Clock, CheckCircle, MapPin, Settings, TrendingUp, Calendar, Search } from "lucide-react"
import Navbar from "../components/Navbar"
import BookingHistory from "../components/BookingHistory"
import ProfileForm from "../components/ProfileForm"
import toast from "react-hot-toast"

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchUserRequests()
    }
  }, [activeTab])

  const fetchUserRequests = async () => {
    try {
      const response = await axios.get("/request/user-requests")
      setRequests(response.data)
    } catch (error) {
      toast.error("Failed to fetch requests")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "accepted":
        return "status-accepted"
      case "completed":
        return "status-completed"
      case "rejected":
        return "status-rejected"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.locationName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || request.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    active: requests.filter((r) => ["pending", "accepted"].includes(r.status)).length,
    completed: requests.filter((r) => r.status === "completed").length,
    total: requests.length,
    thisMonth: requests.filter((r) => {
      const requestDate = new Date(r.createdAt)
      const now = new Date()
      return requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear()
    }).length,
  }

  const renderDashboard = () => (
    <div className="space-y-8 fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-blue-100 mb-6">Ready to get your vehicle serviced? Find trusted mechanics near you.</p>
          <Link
            to="/request"
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Request Mechanic</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Requests</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.active}</p>
              <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.completed}</p>
              <p className="text-xs text-slate-500 mt-1">Successfully finished</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">This Month</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.thisMonth}</p>
              <p className="text-xs text-slate-500 mt-1">Requests made</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Requests</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Recent Requests</h2>

          {/* Search and Filter */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-6 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm || filterStatus !== "all" ? "No matching requests" : "No requests yet"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by requesting a mechanic for your vehicle"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link to="/request" className="btn-primary">
                Request Mechanic
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.slice(0, 5).map((request, index) => (
              <div
                key={request._id}
                className="group p-6 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {request.issueDescription}
                    </h3>
                    <div className="flex items-center text-sm text-slate-600 space-x-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{request.locationName}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    {request.mechanic && (
                      <div className="mt-2 text-sm text-slate-600">
                        <span className="font-medium">Mechanic:</span> {request.mechanic.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`status-badge ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>

                    {request.status === "accepted" && (
                      <Link
                        to={`/track/${request._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline transition-colors"
                      >
                        Track →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredRequests.length > 5 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                >
                  View all requests →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <TrendingUp className="inline h-4 w-4 mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "history"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="inline h-4 w-4 mr-3" />
                  Booking History
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "profile"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
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
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "history" && <BookingHistory userRole="user" />}
            {activeTab === "profile" && <ProfileForm userRole="user" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
