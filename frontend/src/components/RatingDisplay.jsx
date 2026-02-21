"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, ThumbsUp, MessageCircle, Clock, Award, ChevronDown, ChevronUp } from "lucide-react"
import axios from "axios"

const RatingDisplay = ({ mechanicId, showDetailed = false }) => {
  const [ratings, setRatings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAllRatings, setShowAllRatings] = useState(false)

  const fetchRatings = useCallback(async () => {
    try {
      const response = await axios.get(`/ratings/mechanic/${mechanicId}?page=1&limit=5`)
      setRatings(response.data.ratings)
      setStats(response.data.stats)
    } catch (error) {
      console.error("Failed to fetch ratings:", error)
    } finally {
      setLoading(false)
    }
  }, [mechanicId])

  useEffect(() => {
    if (mechanicId) {
      fetchRatings()
    }
  }, [mechanicId, fetchRatings])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const StarRating = ({ rating, size = "w-4 h-4", showNumber = false }) => {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex space-x-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${size} ${star <= rating ? "text-yellow-400 fill-current" : "text-slate-300"}`}
            />
          ))}
        </div>
        {showNumber && <span className="text-sm font-medium text-slate-700 ml-2">{rating.toFixed(1)}</span>}
      </div>
    )
  }

  const RatingBar = ({ label, value, maxValue, color = "bg-blue-500" }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-slate-700 w-16">{label}</span>
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-slate-600 w-8">{value}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No ratings yet</h3>
        <p className="text-slate-600">This mechanic hasn't received any ratings yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-4xl font-bold text-slate-900">{stats.averageRating}</span>
              <StarRating rating={Math.round(stats.averageRating)} size="w-6 h-6" />
            </div>
            <p className="text-slate-600">
              Based on {stats.totalRatings} review{stats.totalRatings !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{stats.recommendationRate}%</div>
            <p className="text-sm text-slate-600">would recommend</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              label={`${star} star`}
              value={stats.ratingDistribution[star] || 0}
              maxValue={stats.totalRatings}
              color={star >= 4 ? "bg-green-500" : star >= 3 ? "bg-yellow-500" : "bg-red-500"}
            />
          ))}
        </div>
      </div>

      {/* Detailed Stats */}
      {showDetailed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
            <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-slate-900">{stats.averageServiceQuality}</div>
            <div className="text-sm text-slate-600">Service Quality</div>
          </div>

          <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
            <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-slate-900">{stats.averageCommunication}</div>
            <div className="text-sm text-slate-600">Communication</div>
          </div>

          <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
            <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-slate-900">{stats.averageTimeliness}</div>
            <div className="text-sm text-slate-600">Timeliness</div>
          </div>

          <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
            <ThumbsUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-slate-900">{stats.averageProfessionalism}</div>
            <div className="text-sm text-slate-600">Professionalism</div>
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Customer Reviews</h3>
          {ratings.length > 3 && (
            <button
              onClick={() => setShowAllRatings(!showAllRatings)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showAllRatings ? "Show Less" : "Show All"}</span>
              {showAllRatings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {(showAllRatings ? ratings : ratings.slice(0, 3)).map((rating) => (
            <div key={rating._id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {rating.user?.profileImage ? (
                    <img
                      src={rating.user.profileImage || "/placeholder.svg"}
                      alt={rating.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">{rating.user?.name?.charAt(0) || "U"}</span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-slate-900">{rating.user?.name || "Anonymous"}</div>
                    <div className="text-sm text-slate-500">{formatDate(rating.createdAt)}</div>
                  </div>
                </div>
                <StarRating rating={rating.rating} showNumber />
              </div>

              {rating.review && <p className="text-slate-700 mb-4 leading-relaxed">{rating.review}</p>}

              {/* Service Details */}
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg mb-4">
                <strong>Service:</strong> {rating.booking?.issueDescription}
              </div>

              {/* Detailed Ratings */}
              {showDetailed && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-slate-600">Quality</div>
                    <StarRating rating={rating.serviceQuality} size="w-3 h-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600">Communication</div>
                    <StarRating rating={rating.communication} size="w-3 h-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600">Timeliness</div>
                    <StarRating rating={rating.timeliness} size="w-3 h-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600">Professional</div>
                    <StarRating rating={rating.professionalism} size="w-3 h-3" />
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {rating.wouldRecommend && (
                <div className="flex items-center space-x-2 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Recommends this mechanic</span>
                </div>
              )}

              {/* Mechanic Response */}
              {rating.mechanicResponse && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">M</span>
                    </div>
                    <span className="font-medium text-blue-900">Mechanic Response</span>
                    <span className="text-sm text-blue-600">{formatDate(rating.mechanicResponseDate)}</span>
                  </div>
                  <p className="text-blue-800">{rating.mechanicResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RatingDisplay
