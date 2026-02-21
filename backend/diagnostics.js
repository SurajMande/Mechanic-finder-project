// Backend Location Sharing Diagnostic Script
// Add this to backend/app.js to trace Socket.IO location sharing flow

const diagnosticsLog = {
  socketConnections: new Map(),
  locationUpdates: [],
  roomJoins: new Map(),

  // Log socket connections
  recordConnection: (socketId) => {
    diagnosticsLog.socketConnections.set(socketId, {
      connectedAt: new Date(),
      events: [],
    })
    console.log(`\n📊 SOCKET CONNECTION TRACKED - Total connections: ${diagnosticsLog.socketConnections.size}`)
  },

  // Record room joins
  recordRoomJoin: (socketId, room) => {
    if (!diagnosticsLog.roomJoins.has(room)) {
      diagnosticsLog.roomJoins.set(room, [])
    }
    diagnosticsLog.roomJoins.get(room).push(socketId)
    console.log(`\n📊 ROOM TRACKING - ${room} has ${diagnosticsLog.roomJoins.get(room).length} member(s)`)
  },

  // Record location updates
  recordLocationUpdate: (data) => {
    diagnosticsLog.locationUpdates.push({
      timestamp: new Date(),
      requestId: data.requestId,
      mechanicId: data.mechanicId,
      location: {
        lat: data.location?.latitude,
        lon: data.location?.longitude,
      },
    })
    console.log(`\n📊 LOCATION UPDATE RECORDED - Total updates: ${diagnosticsLog.locationUpdates.length}`)
  },

  // Report status
  reportStatus: () => {
    console.log("\n" + "=".repeat(60))
    console.log("📊 LOCATION SHARING DIAGNOSTICS REPORT")
    console.log("=".repeat(60))

    console.log(`\n📡 Active Socket Connections: ${diagnosticsLog.socketConnections.size}`)
    diagnosticsLog.socketConnections.forEach((info, socketId) => {
      console.log(`   - ${socketId.substring(0, 8)}... (connected ${info.connectedAt.toLocaleTimeString()})`)
    })

    console.log(`\n🚪 Active Rooms: ${diagnosticsLog.roomJoins.size}`)
    diagnosticsLog.roomJoins.forEach((members, room) => {
      console.log(`   - ${room}: ${members.length} member(s)`)
    })

    console.log(`\n📍 Location Updates Received: ${diagnosticsLog.locationUpdates.length}`)
    if (diagnosticsLog.locationUpdates.length > 0) {
      const latest = diagnosticsLog.locationUpdates[diagnosticsLog.locationUpdates.length - 1]
      console.log(`   Latest: Request ${latest.requestId} from Mechanic ${latest.mechanicId}`)
      console.log(`   Location: ${latest.location.lat.toFixed(4)}, ${latest.location.lon.toFixed(4)}`)
    }

    console.log("\n" + "=".repeat(60))
  },
}

module.exports = diagnosticsLog
