"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Loader } from "lucide-react"
import { locationUtils } from "../utils/locationUtils"

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Custom icons
const createUserIcon = () => {
  return L.icon({
    iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIi8+PHBhdGggZD0iTTEyIDEyYzEuMTA1IDAgMi0uODk1IDItMnMtLjg5NS0yLTItMi0yLjg5NSAyLTIgMiAuODk1IDIgMiAyeiIgZmlsbD0iIzNiODJmNiIvPjwvc3ZnPg==",
    iconSize: [30, 30],
    popupAnchor: [0, -15],
  })
}

const createMechanicIcon = () => {
  return L.icon({
    iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQzNDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4Ii8+PHBhdGggZD0iTTEyIDJ2MjBNMjIgMTJIMiIgc3Ryb2tlPSIjZWY0MzQ0Ii8+PC9zdmc+",
    iconSize: [30, 30],
    popupAnchor: [0, -15],
  })
}

const MapTracker = ({ userLocation, mechanicLocation, distance, estimatedTime, mechanicName, isConnected }) => {
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const userMarker = useRef(null)
  const mechanicMarker = useRef(null)
  const mechanicLabelMarker = useRef(null)
  const polyline = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [loading, setLoading] = useState(true)

  // Update polyline between user and mechanic
  const updatePolyline = useCallback(() => {
    if (!userLocation || !mechanicLocation || !leafletMap.current) return

    if (polyline.current) {
      leafletMap.current.removeLayer(polyline.current)
    }

    polyline.current = L.polyline(
      [
        [userLocation.latitude, userLocation.longitude],
        [mechanicLocation.latitude, mechanicLocation.longitude],
      ],
      {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.7,
        dashArray: "5, 5",
      },
    ).addTo(leafletMap.current)
  }, [userLocation, mechanicLocation])

  // Initialize map
  useEffect(() => {
    if (!userLocation) return

    try {
      // Destroy existing map if any
      if (leafletMap.current) {
        leafletMap.current.remove()
      }

      // Create map centered on user location
      leafletMap.current = L.map(mapRef.current).setView(
        [userLocation.latitude, userLocation.longitude],
        15,
      )

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 5,
      }).addTo(leafletMap.current)

      // Add user marker
      userMarker.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: createUserIcon(),
      })
        .bindPopup(`<strong>Your Location</strong><br>You are here`)
        .addTo(leafletMap.current)

      // Add user location label
      L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.divIcon({
          html: `<div style="background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📍 You</div>`,
          className: "",
          iconSize: [null, null],
        }),
        interactive: false,
      }).addTo(leafletMap.current)

      // Add mechanic marker if available
      if (mechanicLocation) {
        mechanicMarker.current = L.marker([mechanicLocation.latitude, mechanicLocation.longitude], {
          icon: createMechanicIcon(),
        })
          .bindPopup(
            `<strong>${mechanicName || "Mechanic"}'s Location</strong><br>Distance: ${distance ? locationUtils.formatDistance(distance) : "--"}`,
          )
          .addTo(leafletMap.current)

        // Add mechanic location label
        mechanicLabelMarker.current = L.marker([mechanicLocation.latitude, mechanicLocation.longitude], {
          icon: L.divIcon({
            html: `<div style="background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🔧 ${mechanicName || "Mechanic"}</div>`,
            className: "",
            iconSize: [null, null],
          }),
          interactive: false,
        }).addTo(leafletMap.current)

        // Draw polyline between user and mechanic
        updatePolyline()

        // Fit both markers in view
        const bounds = L.latLngBounds(
          [userLocation.latitude, userLocation.longitude],
          [mechanicLocation.latitude, mechanicLocation.longitude],
        )
        leafletMap.current.fitBounds(bounds, { padding: [100, 100] })
      }

      setMapReady(true)
      setLoading(false)
    } catch (error) {
      console.error("Map initialization error:", error)
      setLoading(false)
    }

    return () => {
      // Cleanup is handled by map.remove() on new initialization
    }
  }, [userLocation, mechanicLocation, mechanicName, distance, updatePolyline])

  // Update mechanic marker and polyline
  useEffect(() => {
    if (!leafletMap.current || !mechanicLocation || !mapReady) return

    try {
      // Update mechanic marker
      if (mechanicMarker.current) {
        mechanicMarker.current.setLatLng([mechanicLocation.latitude, mechanicLocation.longitude])
        mechanicMarker.current.setPopupContent(
          `<strong>${mechanicName || "Mechanic"}'s Location</strong><br>Distance: ${distance ? locationUtils.formatDistance(distance) : "--"}`,
        )
      } else {
        // Create marker if it doesn't exist
        mechanicMarker.current = L.marker([mechanicLocation.latitude, mechanicLocation.longitude], {
          icon: createMechanicIcon(),
        })
          .bindPopup(
            `<strong>${mechanicName || "Mechanic"}'s Location</strong><br>Distance: ${distance ? locationUtils.formatDistance(distance) : "--"}`,
          )
          .addTo(leafletMap.current)
      }

      // Update mechanic label marker
      if (mechanicLabelMarker.current) {
        leafletMap.current.removeLayer(mechanicLabelMarker.current)
      }
      mechanicLabelMarker.current = L.marker([mechanicLocation.latitude, mechanicLocation.longitude], {
        icon: L.divIcon({
          html: `<div style="background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🔧 ${mechanicName || "Mechanic"}</div>`,
          className: "",
          iconSize: [null, null],
        }),
        interactive: false,
      }).addTo(leafletMap.current)

      // Update polyline
      updatePolyline()
    } catch (error) {
      console.error("Marker update error:", error)
    }
  }, [mechanicLocation, distance, mechanicName, mapReady, updatePolyline])

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
        <div ref={mapRef} className="h-96 w-full bg-slate-100 flex items-center justify-center relative">
          {loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 flex flex-col items-center space-y-2">
                <Loader className="h-6 w-6 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-slate-900">Loading map...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Info Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></div>
            <span className={`text-sm font-medium ${isConnected ? "text-green-600" : "text-amber-600"}`}>
              {isConnected ? "Live Tracking Active" : "Connecting..."}
            </span>
          </div>
          <span className="text-xs text-slate-500">Real-time updatesActive</span>
        </div>

        {/* Distance and ETA */}
        {distance !== null && estimatedTime !== null && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-slate-600 font-medium mb-1">Distance</p>
              <p className="text-lg font-bold text-blue-600">{locationUtils.formatDistance(distance)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <p className="text-xs text-slate-600 font-medium mb-1">ETA</p>
              <p className="text-lg font-bold text-indigo-600">{estimatedTime} min</p>
            </div>
          </div>
        )}

        {/* Status Message */}
        {distance !== null && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-slate-700">
              {distance < 0.5
                ? "🔴 Your mechanic is very close!"
                : distance < 1
                  ? "🟡 Mechanic is almost here!"
                  : "🟢 Mechanic is on the way"}
            </span>
          </div>
        )}
      </div>

      {/* Location Legend */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
          <p className="text-xs font-bold text-blue-600 mb-2">📍 YOUR LOCATION</p>
          <p className="text-xs text-slate-600">This is your pickup location</p>
          {userLocation && (
            <p className="text-xs text-slate-500 mt-1">
              {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </p>
          )}
        </div>

        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-300">
          <p className="text-xs font-bold text-red-600 mb-2">🔧 MECHANIC LOCATION</p>
          <p className="text-xs text-slate-600">{mechanicName || "Mechanic"} is here</p>
          {mechanicLocation && (
            <p className="text-xs text-slate-500 mt-1">
              {mechanicLocation.latitude.toFixed(4)}, {mechanicLocation.longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapTracker
