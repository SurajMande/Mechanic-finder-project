"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, MapPin, User, Wrench, Search, Filter, Star } from "lucide-react"
import RatingModal from "./RatingModal"
import toast from "react-hot-toast"

const BookingHistory = ({ userRole }) => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRatingModal, setShowRatingModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/bookings/history")
      setBookings(response.data)
    } catch (error) {
      toast.error("Failed to fetch booking history")
    } finally {
      setLoading(false)
    }
  }

  const handleRateBooking = (booking) => {
    setSelectedBooking(booking)
    setShowRatingModal(true)
  }

  const handleRatingSubmitted = () => {
    // Refresh bookings to show updated rating
    fetchBookings()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "status-completed"
      case "cancelled":
        return "status-rejected"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const searchFields = [
      booking.issueDescription,
      booking.locationName,
      userRole === "user" ? booking.mechanic?.name : booking.user?.name,
    ].filter(Boolean)

    const matchesSearch = searchFields.some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === "all" || booking.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 sm:mb-0">Booking History</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
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
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 fade-in">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No booking history</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Your completed bookings will appear here once you start using our services.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Booking History</h2>
          <p className="text-slate-600 mt-1">View your past service requests and completed jobs</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No matching bookings</h3>
          <p className="text-slate-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking, index) => (
            <div
              key={booking._id}
              className="card-elevated group hover:scale-[1.01] transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  {userRole === "user" ? (
                    // Show mechanic info for users
                    <>
                      {booking.mechanic?.profileImage ? (
                        <img
                          src={booking.mechanic.profileImage || "/placeholder.svg"}
                          alt={booking.mechanic.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-4 ring-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ring-4 ring-slate-100">
                          <Wrench className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{booking.mechanic?.name}</h3>
                        <p className="text-slate-600 text-sm">{booking.mechanic?.specialization}</p>
                        {booking.mechanic?.rating && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-slate-600">{booking.mechanic.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    // Show user info for mechanics
                    <>
                      {booking.user?.profileImage ? (
                        <img
                          src={booking.user.profileImage || "/placeholder.svg"}
                          alt={booking.user.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-4 ring-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ring-4 ring-slate-100">
                          <User className="h-6 w-6 sm:h-7 sm:w-7 text-slate-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{booking.user?.name}</h3>
                        <p className="text-slate-600 text-sm">{booking.user?.phone}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`status-badge ${getStatusColor(booking.status)} self-start`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>

                  {/* Rating Display */}
                  {booking.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-slate-700">{booking.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Service Details</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{booking.issueDescription}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <MapPin className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
                      <p className="text-sm font-medium text-slate-900">{booking.locationName}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <Calendar className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(booking.completedAt || booking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.cost > 0 && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <span className="font-semibold text-green-900">Total Cost</span>
                    <span className="text-xl font-bold text-green-700">${booking.cost}</span>
                  </div>
                )}

                {/* Rating Section */}
                {userRole === "user" && booking.status === "completed" && (
                  <div className="border-t border-slate-200 pt-4">
                    {booking.rating ? (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">Your Rating</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < booking.rating ? "text-yellow-500 fill-current" : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {booking.review && <p className="text-blue-800 text-sm mt-2">{booking.review}</p>}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRateBooking(booking)}
                        className="w-full p-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Star className="h-5 w-5 mx-auto mb-2" />
                        <span className="font-medium">Rate this service</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedBooking && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false)
            setSelectedBooking(null)
          }}
          booking={selectedBooking}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}

export default BookingHistory
