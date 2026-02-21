import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { auth } from "./utils/auth"

// Screens
import LandingPage from "./screens/LandingPage"
import LoginPage from "./screens/LoginPage"
import SignupPage from "./screens/SignupPage"
import UserDashboard from "./screens/UserDashboard"
import MechanicDashboard from "./screens/MechanicDashboard"
import RequestPage from "./screens/RequestPage"
import TrackMechanic from "./screens/TrackMechanic"

// Components
import MechanicPortfolio from "./components/MechanicPortfolio"

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = auth.isAuthenticated()
  const userRole = auth.getUserRole()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = auth.isAuthenticated()
  const userRole = auth.getUserRole()

  if (isAuthenticated) {
    return <Navigate to={userRole === "mechanic" ? "/mechanic/dashboard" : "/user/dashboard"} replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "white",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "white",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "white",
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mechanic/dashboard"
            element={
              <ProtectedRoute requiredRole="mechanic">
                <MechanicDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/request"
            element={
              <ProtectedRoute requiredRole="user">
                <RequestPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/track/:requestId"
            element={
              <ProtectedRoute requiredRole="user">
                <TrackMechanic />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mechanic/portfolio/:mechanicId"
            element={<MechanicPortfolio />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
