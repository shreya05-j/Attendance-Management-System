import ProtectedRoute from "./ProtectedRoute";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for admin-only pages.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
}
