import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AuthorityRoute from './components/AuthorityRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
import SubmitComplaint from './pages/SubmitComplaint.jsx';
import MyComplaints from './pages/MyComplaints.jsx';
import ComplaintDetail from './pages/ComplaintDetail.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AuthorityAssigned from './pages/authority/AuthorityAssigned.jsx';
import Placeholder from './pages/Placeholder.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/assigned"
          element={
            <AuthorityRoute>
              <AuthorityAssigned />
            </AuthorityRoute>
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
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/new"
          element={
            <ProtectedRoute>
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/:id"
          element={
            <ProtectedRoute>
              <ComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}
