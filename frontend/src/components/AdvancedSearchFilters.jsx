"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, DollarSign, X, Sliders } from "lucide-react"
import { locationUtils } from "../utils/locationUtils"

const AdvancedSearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    searchTerm: "",
    location: {
      latitude: null,
      longitude: null,
      address: "",
      radius: 10,
    },
    specialization: "all",
    minRating: 0,
    maxPrice: 1000,
    availability: "all",
    experience: {
      min: 0,
      max: 50,
    },
    sortBy: "distance",
    ...initialFilters,
  })

  const specializations = [
    "Engine Repair",
    "Brake Service",
    "Transmission",
    "Electrical",
    "AC Repair",
    "General Maintenance",
  ]

  const sortOptions = [
    { value: "distance", label: "Distance" },
    { value: "rating", label: "Rating" },
    { value: "price", label: "Price" },
    { value: "experience", label: "Experience" },
    { value: "completedJobs", label: "Jobs Completed" },
  ]

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLocationChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }))
  }

  const handleExperienceChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [field]: Number.parseInt(value),
      },
    }))
  }

  const getCurrentLocation = async () => {
    try {
      const position = await locationUtils.getCurrentPosition()
      const address = await locationUtils.getAddressFromCoords(position.latitude, position.longitude)

      handleLocationChange("latitude", position.latitude)
      handleLocationChange("longitude", position.longitude)
      handleLocationChange("address", address)
    } catch (error) {
      console.error("Location error:", error)
    }
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      location: {
        latitude: null,
        longitude: null,
        address: "",
        radius: 10,
      },
      specialization: "all",
      minRating: 0,
      maxPrice: 1000,
      availability: "all",
      experience: {
        min: 0,
        max: 50,
      },
      sortBy: "distance",
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.location.address) count++
    if (filters.specialization !== "all") count++
    if (filters.minRating > 0) count++
    if (filters.maxPrice < 1000) count++
    if (filters.availability !== "all") count++
    if (filters.experience.min > 0 || filters.experience.max < 50) count++
    return count
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search mechanics, services, or areas..."
            value={filters.searchTerm}
            onChange={(e) => handleInputChange("searchTerm", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
            isOpen ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="space-y-6 pt-4 border-t border-slate-200 fade-in">
          {/* Location Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Location & Radius</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter location or use current location"
                  value={filters.location.address}
                  onChange={(e) => handleLocationChange("address", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <button
                onClick={getCurrentLocation}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                Use Current
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600">Radius:</span>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.location.radius}
                onChange={(e) => handleLocationChange("radius", Number.parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-slate-700 min-w-[60px]">{filters.location.radius} km</span>
            </div>
          </div>

          {/* Specialization Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => handleInputChange("specialization", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Minimum Rating</label>
            <div className="flex items-center space-x-3">
              <Star className="h-4 w-4 text-amber-400" />
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => handleInputChange("minRating", Number.parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-slate-700 min-w-[60px]">{filters.minRating}+ stars</span>
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Maximum Price</label>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-4 w-4 text-green-500" />
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", Number.parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-slate-700 min-w-[80px]">${filters.maxPrice}</span>
            </div>
          </div>

          {/* Experience Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Experience (Years)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Minimum</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={filters.experience.min}
                  onChange={(e) => handleExperienceChange("min", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Maximum</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={filters.experience.max}
                  onChange={(e) => handleExperienceChange("max", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => handleInputChange("availability", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Mechanics</option>
              <option value="available">Available Now</option>
              <option value="today">Available Today</option>
              <option value="weekend">Available Weekends</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleInputChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={clearFilters}
              className="flex items-center justify-center space-x-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearchFilters
