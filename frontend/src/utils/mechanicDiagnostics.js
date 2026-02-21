// Comprehensive Location Sharing Diagnostics
// Run this in browser console on MechanicDashboard to debug location sharing

window.mechanicDiagnostics = {
  // Check 1: Is geolocation available?
  checkGeolocation: () => {
    if ("geolocation" in navigator) {
      console.log("✅ Geolocation API available")
      return true
    } else {
      console.error("❌ Geolocation API NOT available")
      return false
    }
  },

  // Check 2: Get current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error("❌ Geolocation not available")
        reject()
        return
      }

      console.log("📍 Requesting location...")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Got location:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
          resolve(position.coords)
        },
        (error) => {
          console.error("❌ Location error:", error.message)
          reject(error)
        }
      )
    })
  },

  // Check 3: Watch location
  startLocationWatch: () => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not available")
      return
    }

    console.log("👁️ Starting location watch...")
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log("📍 Location changed:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toLocaleTimeString(),
        })
      },
      (error) => {
        console.error("❌ Watch error:", error.message)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    )

    console.log("Watch ID:", watchId)
    window.mechanicDiagnostics.currentWatchId = watchId
    return watchId
  },

  // Check 4: Stop location watch
  stopLocationWatch: () => {
    if (window.mechanicDiagnostics.currentWatchId !== null) {
      navigator.geolocation.clearWatch(window.mechanicDiagnostics.currentWatchId)
      console.log("⛔ Location watch stopped")
      window.mechanicDiagnostics.currentWatchId = null
    }
  },

  // Check 5: Test Socket.IO emit
  testSocketEmit: (requestId, mechanicId) => {
    // Get current location first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const testData = {
          requestId: requestId || "test-request-123",
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          mechanicId: mechanicId || "test-mechanic-456",
        }

        console.log("📡 Testing Socket.IO emit with data:")
        console.log(JSON.stringify(testData, null, 2))

        // Find and emit through socket - this is a bit hacky but useful for testing
        // In real scenario, this would be done by MechanicLocationSharer component
        const io = window.io || window.io
        if (io && io.connect) {
          const socket = io("http://localhost:5000", {
            reconnection: true,
            transports: ["websocket", "polling"],
          })

          socket.on("connect", () => {
            console.log("✅ Test socket connected:", socket.id)
            socket.emit("update-location", testData)
            console.log("📤 Emitted update-location event")

            setTimeout(() => {
              socket.disconnect()
              console.log("🔌 Test socket disconnected")
            }, 1000)
          })

          socket.on("error", (error) => {
            console.error("❌ Socket error:", error)
          })
        } else {
          console.error("❌ Socket.IO not loaded in window")
        }
      },
      (error) => {
        console.error("❌ Could not get location:", error)
      }
    )
  },

  // Check 6: Check React state
  checkReactState: () => {
    console.log("🔍 Checking React component state...")
    console.log("Note: This requires React DevTools to access component state")
    console.log("Look for MechanicDashboard > activeRequests and mechanicProfile")
  },

  // Run all diagnostics
  runAll: async () => {
    console.log("\n🧪 STARTING COMPREHENSIVE DIAGNOSTICS\n")
    console.log("=" .repeat(50))

    console.log("\n1️⃣  Checking Geolocation API...")
    this.checkGeolocation()

    console.log("\n2️⃣  Getting current location...")
    try {
      await this.getCurrentLocation()
    } catch (e) {
      console.log("⚠️  Could not get location (may need permission)")
    }

    console.log("\n3️⃣  Starting location watch (5 seconds)...")
    const watchId = this.startLocationWatch()

    console.log("\n4️⃣  To test Socket.IO emit, run:")
    console.log("   mechanicDiagnostics.testSocketEmit('your-request-id', 'your-mechanic-id')")

    setTimeout(() => {
      this.stopLocationWatch()
      console.log("\n✅ DIAGNOSTICS COMPLETE")
      console.log("=" .repeat(50))
    }, 5000)
  },

  currentWatchId: null,
}

console.log("✅ Mechanic Location Diagnostics loaded!")
console.log("Commands:")
console.log("  mechanicDiagnostics.runAll()")
console.log("  mechanicDiagnostics.checkGeolocation()")
console.log("  mechanicDiagnostics.getCurrentLocation()")
console.log("  mechanicDiagnostics.startLocationWatch()")
console.log("  mechanicDiagnostics.stopLocationWatch()")
console.log("  mechanicDiagnostics.testSocketEmit(requestId, mechanicId)")
