import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useAuthStore } from "./hooks/useAuthStore";

import AdminRoute from "./components/AdminRoute";
import FacultyRoute from "./components/FacultyRoute";
import StudentRoute from "./components/StudentRoute";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Layout = lazy(() => import("./components/Layout"));

const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAlerts = lazy(() => import("./pages/admin/AdminAlerts"));
const FacultyDashboard = lazy(() => import("./pages/dashboard/FacultyDashboard"));
const StudentDashboard = lazy(() => import("./pages/dashboard/StudentDashboard"));

const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const SubjectsPage = lazy(() => import("./pages/SubjectsPage"));
const StudentsPage = lazy(() => import("./pages/StudentsPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const MarkAttendancePage = lazy(() => import("./pages/MarkAttendancePage"));
const QRAttendancePage = lazy(() => import("./pages/QRAttendancePage"));
const LeavesPage = lazy(() => import("./pages/LeavesPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const EmailAlertsPage = lazy(() => import("./pages/EmailAlertsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin h-8 w-8 border-2 border-[#408A71] border-t-transparent rounded-full" />
        <span className="text-xs text-[#408A71]">Loading...</span>
      </div>
    </div>
  );
}

function L({ Component }: { Component: React.LazyExoticComponent<any> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  const { fetchMe, isInitialized } = useAuthStore();

  // Hydrate auth state once on mount
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Show a brief splash while verifying token (typically < 500ms)
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#091413] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-2 border-[#408A71] border-t-transparent rounded-full" />
          <span className="text-xs text-[#408A71] font-medium">Loading AMS...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<L Component={LandingPage} />} />
        <Route path="/login" element={<L Component={Login} />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <Layout />
              </Suspense>
            </AdminRoute>
          }
        >
          <Route index element={<L Component={AdminOverview} />} />
          <Route path="analytics" element={<L Component={AdminAnalytics} />} />
          <Route path="alerts" element={<L Component={AdminAlerts} />} />
          <Route path="courses" element={<L Component={CoursesPage} />} />
          <Route path="subjects" element={<L Component={SubjectsPage} />} />
          <Route path="students" element={<L Component={StudentsPage} />} />
          <Route path="attendance" element={<L Component={AttendancePage} />} />
          <Route path="mark-attendance" element={<L Component={MarkAttendancePage} />} />
          <Route path="qr-attendance" element={<L Component={QRAttendancePage} />} />
          <Route path="leaves" element={<L Component={LeavesPage} />} />
          <Route path="email-alerts" element={<L Component={EmailAlertsPage} />} />
          <Route path="reports" element={<L Component={ReportsPage} />} />
          <Route path="users" element={<L Component={UsersPage} />} />
        </Route>

        {/* Faculty */}
        <Route
          path="/faculty"
          element={
            <FacultyRoute>
              <Suspense fallback={<PageLoader />}>
                <Layout />
              </Suspense>
            </FacultyRoute>
          }
        >
          <Route index element={<L Component={FacultyDashboard} />} />
          <Route path="subjects" element={<L Component={SubjectsPage} />} />
          <Route path="students" element={<L Component={StudentsPage} />} />
          <Route path="attendance" element={<L Component={AttendancePage} />} />
          <Route path="mark-attendance" element={<L Component={MarkAttendancePage} />} />
          <Route path="qr-attendance" element={<L Component={QRAttendancePage} />} />
          <Route path="leaves" element={<L Component={LeavesPage} />} />
          <Route path="reports" element={<L Component={ReportsPage} />} />
        </Route>

        {/* Student */}
        <Route
          path="/student"
          element={
            <StudentRoute>
              <Suspense fallback={<PageLoader />}>
                <Layout />
              </Suspense>
            </StudentRoute>
          }
        >
          <Route index element={<L Component={StudentDashboard} />} />
          <Route path="subjects" element={<L Component={SubjectsPage} />} />
          <Route path="attendance" element={<L Component={AttendancePage} />} />
          <Route path="leaves" element={<L Component={LeavesPage} />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

function RootRedirect() {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/" replace />;
  switch (user.role) {
    case "admin": return <Navigate to="/admin" replace />;
    case "faculty": return <Navigate to="/faculty" replace />;
    case "student": return <Navigate to="/student" replace />;
    default: return <Navigate to="/" replace />;
  }
}
