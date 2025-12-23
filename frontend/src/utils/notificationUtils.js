// Push notification utilities
export const notificationUtils = {
  // Check if notifications are supported
  isSupported: () => {
    return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
  },

  // Request notification permission
  requestPermission: async () => {
    if (!notificationUtils.isSupported()) {
      throw new Error("Notifications not supported")
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  },

  // Show local notification
  showNotification: (title, options = {}) => {
    if (!notificationUtils.isSupported() || Notification.permission !== "granted") {
      return null
    }

    const defaultOptions = {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      ...options,
    }

    return new Notification(title, defaultOptions)
  },

  // Show service request notification
  showServiceRequest: (request) => {
    return notificationUtils.showNotification("🔧 New Service Request", {
      body: `${request.user?.name} needs help with: ${request.issueDescription.substring(0, 100)}...`,
      icon: "/mechanic-icon.png",
      tag: `request-${request._id}`,
      data: { type: "service-request", requestId: request._id },
      actions: [
        { action: "accept", title: "Accept" },
        { action: "view", title: "View Details" },
      ],
    })
  },

  // Show status update notification
  showStatusUpdate: (status, mechanicName) => {
    const messages = {
      accepted: `✅ ${mechanicName} accepted your request`,
      "in-progress": `🔧 ${mechanicName} is working on your vehicle`,
      completed: `🎉 Service completed by ${mechanicName}`,
    }

    return notificationUtils.showNotification("Service Update", {
      body: messages[status] || "Your service request has been updated",
      icon: "/service-icon.png",
      tag: "status-update",
    })
  },

  // Show location update notification
  showLocationUpdate: (mechanicName, distance) => {
    return notificationUtils.showNotification("📍 Mechanic Location", {
      body: `${mechanicName} is ${distance} away from your location`,
      icon: "/location-icon.png",
      tag: "location-update",
    })
  },

  // Register service worker for push notifications
  registerServiceWorker: async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker not supported")
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered:", registration)
      return registration
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      throw error
    }
  },

  // Subscribe to push notifications
  subscribeToPush: async (registration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      })
      return subscription
    } catch (error) {
      console.error("Push subscription failed:", error)
      throw error
    }
  },
}
