import ProtectedRoute from "./ProtectedRoute";

interface StudentRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for student-only pages.
 */
export default function StudentRoute({ children }: StudentRouteProps) {
  return <ProtectedRoute allowedRoles={["student"]}>{children}</ProtectedRoute>;
}
