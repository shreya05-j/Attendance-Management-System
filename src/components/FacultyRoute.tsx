import ProtectedRoute from "./ProtectedRoute";

interface FacultyRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for faculty-only pages.
 */
export default function FacultyRoute({ children }: FacultyRouteProps) {
  return <ProtectedRoute allowedRoles={["faculty"]}>{children}</ProtectedRoute>;
}
