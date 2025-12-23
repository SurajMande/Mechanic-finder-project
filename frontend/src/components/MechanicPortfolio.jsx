"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import {
  Star,
  MapPin,
  Clock,
  Award,
  Briefcase,
  Phone,
  Mail,
  CheckCircle,
  ExternalLink,
  ImageIcon,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react"
import RatingDisplay from "./RatingDisplay"
import toast from "react-hot-toast"

const MechanicPortfolio = () => {
  const { mechanicId } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchPortfolio()
  }, [mechanicId])

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`/portfolio/${mechanicId}`)
      setPortfolio(response.data)
    } catch (error) {
      toast.error("Failed to load mechanic portfolio")
      console.error("Portfolio fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAvailabilityStatus = (availability) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "lowercase" })
    const todaySchedule = availability[today]

    if (!todaySchedule?.available) {
      return { status: "Closed Today", color: "text-red-600" }
    }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [startHour, startMin] = todaySchedule.start.split(":").map(Number)
    const [endHour, endMin] = todaySchedule.end.split(":").map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (currentTime >= startTime && currentTime <= endTime) {
      return { status: "Open Now", color: "text-green-600" }
    } else if (currentTime < startTime) {
      return { status: `Opens at ${todaySchedule.start}`, color: "text-amber-600" }
    } else {
      return { status: "Closed", color: "text-red-600" }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Portfolio Not Found</h3>
          <p className="text-slate-600 mb-6">This mechanic's portfolio is not available or has been made private.</p>
          <Link to="/user/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { mechanic } = portfolio
  const availabilityStatus = getAvailabilityStatus(portfolio.availability)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="card-elevated mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {mechanic.profileImage ? (
                <img
                  src={mechanic.profileImage || "/placeholder.svg"}
                  alt={mechanic.name}
                  className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white shadow-lg">
                  <Users className="h-16 w-16 text-white" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{mechanic.name}</h1>
                  <p className="text-lg text-blue-600 font-semibold mb-2">{mechanic.specialization}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{mechanic.experience} years experience</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>{mechanic.completedJobs} jobs completed</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 text-right">
                  <div className="flex items-center justify-end mb-2">
                    <Star className="h-5 w-5 text-amber-400 mr-1" />
                    <span className="text-xl font-bold text-slate-900">{mechanic.rating.toFixed(1)}</span>
                    <span className="text-slate-600 ml-1">({mechanic.totalRatings} reviews)</span>
                  </div>
                  <div className={`text-sm font-medium ${availabilityStatus.color}`}>{availabilityStatus.status}</div>
                </div>
              </div>

              {/* Bio */}
              {portfolio.bio && <p className="text-slate-700 leading-relaxed mb-4">{portfolio.bio}</p>}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${mechanic.phone}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Now</span>
                </a>
                <a
                  href={`mailto:${mechanic.email}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "services", label: "Services", icon: Briefcase },
            { id: "certifications", label: "Certifications", icon: Award },
            { id: "gallery", label: "Work Gallery", icon: ImageIcon },
            { id: "reviews", label: "Reviews", icon: Star },
            { id: "availability", label: "Availability", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="card text-center">
                    <div className="text-2xl font-bold text-blue-600">{mechanic.completedJobs}</div>
                    <div className="text-sm text-slate-600">Jobs Completed</div>
                  </div>
                  <div className="card text-center">
                    <div className="text-2xl font-bold text-green-600">{mechanic.rating.toFixed(1)}</div>
                    <div className="text-sm text-slate-600">Average Rating</div>
                  </div>
                  <div className="card text-center">
                    <div className="text-2xl font-bold text-purple-600">{mechanic.experience}</div>
                    <div className="text-sm text-slate-600">Years Experience</div>
                  </div>
                  <div className="card text-center">
                    <div className="text-2xl font-bold text-amber-600">{portfolio.views}</div>
                    <div className="text-sm text-slate-600">Profile Views</div>
                  </div>
                </div>

                {/* Recent Achievements */}
                {portfolio.achievements && portfolio.achievements.length > 0 && (
                  <div className="card-elevated">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Achievements</h3>
                    <div className="space-y-3">
                      {portfolio.achievements.slice(0, 3).map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <div className="text-2xl">{achievement.icon || "🏆"}</div>
                          <div>
                            <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                            <p className="text-sm text-slate-600">{achievement.description}</p>
                            <p className="text-xs text-slate-500">{formatDate(achievement.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Service Areas */}
              <div className="space-y-6">
                {portfolio.serviceAreas && portfolio.serviceAreas.length > 0 && (
                  <div className="card-elevated">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Service Areas
                    </h3>
                    <div className="space-y-3">
                      {portfolio.serviceAreas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-900">{area.city}</span>
                          <span className="text-sm text-slate-600">{area.radius}km radius</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools */}
                {portfolio.tools && portfolio.tools.length > 0 && (
                  <div className="card-elevated">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Tools</h3>
                    <div className="space-y-2">
                      {portfolio.tools.slice(0, 5).map((tool, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{tool.name}</span>
                          {tool.brand && <span className="text-slate-600">({tool.brand})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="card-elevated">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Services Offered</h3>
              {portfolio.services && portfolio.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolio.services.map((service, index) => (
                    <div
                      key={index}
                      className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{service.name}</h4>
                      <p className="text-slate-600 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        {service.estimatedPrice && (
                          <span className="text-green-600 font-medium">
                            ${service.estimatedPrice.min} - ${service.estimatedPrice.max}
                          </span>
                        )}
                        {service.duration && (
                          <span className="text-slate-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No services listed yet</p>
                </div>
              )}
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === "certifications" && (
            <div className="card-elevated">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Certifications & Credentials</h3>
              {portfolio.certifications && portfolio.certifications.length > 0 ? (
                <div className="space-y-6">
                  {portfolio.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start space-x-4 p-6 border border-slate-200 rounded-xl">
                      <div className="flex-shrink-0">
                        {cert.verified ? (
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Shield className="h-6 w-6 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Award className="h-6 w-6 text-amber-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900">{cert.name}</h4>
                            <p className="text-slate-600 mb-2">Issued by {cert.issuer}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Obtained: {formatDate(cert.dateObtained)}</span>
                              {cert.expiryDate && <span>Expires: {formatDate(cert.expiryDate)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {cert.verified && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Verified
                              </span>
                            )}
                            {cert.certificateImage && (
                              <button className="text-blue-600 hover:text-blue-800">
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No certifications listed yet</p>
                </div>
              )}
            </div>
          )}

          {/* Work Gallery Tab */}
          {activeTab === "gallery" && (
            <div className="card-elevated">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Work Gallery</h3>
              {portfolio.workImages && portfolio.workImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.workImages.map((image, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.description || "Work sample"}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          {image.description && <p className="text-white text-sm font-medium">{image.description}</p>}
                          <p className="text-white/80 text-xs mt-1">{formatDate(image.uploadedAt)}</p>
                        </div>
                      </div>
                      {image.beforeImage && image.afterImage && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Before/After</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No work samples available yet</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="card-elevated">
              <RatingDisplay mechanicId={mechanicId} showTitle={true} />
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === "availability" && (
            <div className="card-elevated">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Weekly Availability</h3>
              <div className="space-y-4">
                {Object.entries(portfolio.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${schedule.available ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      <span className="font-medium text-slate-900 capitalize">{day}</span>
                    </div>
                    <div className="text-slate-600">
                      {schedule.available ? (
                        <span>
                          {schedule.start} - {schedule.end}
                        </span>
                      ) : (
                        <span>Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            to="/request"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Request Service
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-slate-100 text-slate-700 text-center py-3 px-6 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default MechanicPortfolio
