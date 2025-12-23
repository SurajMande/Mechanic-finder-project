"use client"

import { useState, useEffect } from "react"
import { X, Star, ThumbsUp, MessageCircle, Clock, Award, Send } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const StarRating = ({ value, onChange, size = 24, readonly = false }) => {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className="transition-transform hover:scale-105"
        >
          <Star
            style={{ width: size, height: size }}
            className={
              star <= (hover || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  )
}

const RatingModal = ({ isOpen, onClose, booking, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [detailedRatings, setDetailedRatings] = useState({
    serviceQuality: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
  })

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", esc)
    return () => document.removeEventListener("keydown", esc)
  }, [onClose])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return toast.error("Please select a rating")

    setLoading(true)
    try {
      await axios.post("/ratings", {
        bookingId: booking._id,
        rating,
        review,
        wouldRecommend,
        ...Object.fromEntries(
          Object.entries(detailedRatings).map(([k, v]) => [k, v || rating])
        ),
      })

      toast.success("Rating submitted")
      onRatingSubmitted()
      onClose()
    } catch (err) {
      toast.error("Failed to submit rating")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Rate your experience
            </h2>
            <p className="text-sm text-slate-500">
              Your feedback helps improve service quality
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8 max-h-[70vh] overflow-y-auto">

          {/* Mechanic */}
          <div className="flex gap-4 bg-slate-50 p-4 rounded-xl">
            <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <Award className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {booking.mechanic?.name}
              </p>
              <p className="text-sm text-slate-500">
                {booking.mechanic?.specialization}
              </p>
            </div>
          </div>

          {/* Overall rating */}
          <div className="text-center space-y-3">
            <p className="font-medium text-slate-800">Overall rating</p>
            <StarRating value={rating} onChange={setRating} size={36} />
          </div>

          {/* Detailed ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              ["serviceQuality", "Service quality", Award],
              ["communication", "Communication", MessageCircle],
              ["timeliness", "Timeliness", Clock],
              ["professionalism", "Professionalism", ThumbsUp],
            ].map(([key, label, Icon]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Icon className="h-4 w-4 text-blue-600" />
                  {label}
                </div>
                <StarRating
                  value={detailedRatings[key]}
                  onChange={(v) =>
                    setDetailedRatings((p) => ({ ...p, [key]: v }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Review (optional)
            </label>
            <textarea
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Share anything that stood out…"
            />
          </div>

          {/* Recommend */}
          <div className="flex gap-3">
            {[
              [true, "Recommend"],
              [false, "Not recommend"],
            ].map(([val, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setWouldRecommend(val)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  wouldRecommend === val
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border px-4 py-3 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rating || loading}
              className="flex-1 rounded-xl bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {loading ? "Submitting…" : "Submit"}
              {!loading && <Send className="h-4 w-4" />}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default RatingModal
