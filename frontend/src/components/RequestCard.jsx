"use client"

import { MapPin, Clock, User, Phone, MessageCircle } from "lucide-react"

const RequestCard = ({ request, onAccept, onReject, showActions = true }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "accepted":
        return "status-accepted"
      case "rejected":
        return "status-rejected"
      case "completed":
        return "status-completed"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="card-elevated group hover:scale-[1.02] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {request.user?.profileImage ? (
            <img
              src={request.user.profileImage || "/placeholder.svg"}
              alt={request.user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-100"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ring-4 ring-slate-100">
              <User className="h-7 w-7 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{request.user?.name}</h3>
            <div className="flex items-center text-slate-600 text-sm mt-1">
              <Phone className="h-4 w-4 mr-1" />
              <a href={`tel:${request.user?.phone}`} className="hover:text-blue-600 transition-colors">
                {request.user?.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {request.priority && (
            <span className={`status-badge ${getPriorityColor(request.priority)}`}>
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
            </span>
          )}
          <span className={`status-badge ${getStatusColor(request.status)}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-900 mb-2">Issue Description</h4>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">{request.issueDescription}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl">
            <MapPin className="h-5 w-5 mr-3 text-blue-600" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
              <p className="text-sm font-medium text-slate-900">{request.locationName || "Location not available"}</p>
            </div>
          </div>

          <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl">
            <Clock className="h-5 w-5 mr-3 text-green-600" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Requested</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(request.createdAt)}</p>
            </div>
          </div>
        </div>

        {request.issueImage && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Issue Photo</h4>
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={request.issueImage || "/placeholder.svg"}
                alt="Issue"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        )}

        {request.notes && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Additional Notes
            </h4>
            <p className="text-slate-700 bg-blue-50 p-4 rounded-xl border border-blue-100">{request.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && request.status === "pending" && (
        <div className="flex space-x-3 mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={() => onAccept(request._id)}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Accept Request
          </button>
          <button
            onClick={() => onReject(request._id)}
            className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-200 transition-all duration-200 hover:scale-105"
          >
            Decline
          </button>
        </div>
      )}

      {request.status === "accepted" && request.mechanic && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium">Request Accepted</span>
            </div>
            <span className="text-green-600 text-sm">In Progress</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestCard
