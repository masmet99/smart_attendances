import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DashboardUser from "./pages/DashboardUser";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardAdmin from "./pages/DashboardAdmin";
import AdminAttendance from "./pages/AdminAttendance";
import CheckIn from "./pages/CheckIn";
import AdminGeofence from "./pages/AdminGeofence";

import RegisterFace from "./pages/RegisterFace";
import AttendanceHistory from "./pages/AttendanceHistory";
import UserManagement from "./pages/UserManagement";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute>
              <AdminAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkin"
          element={<CheckIn />}
        />

        <Route
          path="/register-face"
          element={<RegisterFace />}
        />

        <Route
          path="/history"
          element={<AttendanceHistory />}
        />

        <Route
          path="/admin/geofence"
          element={
            <AdminGeofence />
          }
        />

        <Route
          path="/admin/users"
          element={<UserManagement />}
        />

        </Routes>

    </BrowserRouter>
  );
}

export default App;