import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import PsychometricTest from "./pages/PsychometricTest";
import CareerResults from "./pages/CareerResults";
import Colleges from "./pages/Colleges";
import Courses from "./pages/Courses";
import SavedColleges from "./pages/SavedColleges";
import SavedCourses from "./pages/SavedCourses";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register", "/forgot-password"];
  const hideNavbarPrefixes = ["/verify-email/", "/reset-password/"];
  const shouldShowNavbar =
    !hideNavbarRoutes.includes(location.pathname) &&
    !hideNavbarPrefixes.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/psychometric-test" element={<PsychometricTest />} />
        <Route path="/career-results" element={<CareerResults />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/courses" element={<Courses />} />
        <Route
          path="/saved-colleges"
          element={
            <ProtectedRoute>
              <SavedColleges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-courses"
          element={
            <ProtectedRoute>
              <SavedCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
