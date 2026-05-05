import { Navigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "faculty" | "student")[];
}

/**
 * Route guard that:
 * 1. Redirects unauthenticated users to /login
 * 2. Optionally restricts access by role (RBAC)
 * 3. Redirects unauthorized roles to their own dashboard
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user, isInitialized } = useAuthStore();

  // Wait for auth initialization to complete
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard if they don't have access
    const rolePaths: Record<string, string> = {
      admin: "/admin",
      faculty: "/faculty",
      student: "/student",
    };
    return <Navigate to={rolePaths[user.role] || "/"} replace />;
  }

  return <>{children}</>;
}
