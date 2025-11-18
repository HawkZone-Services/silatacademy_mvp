import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = () => {
      // token saved in either sessionStorage or localStorage depending on rememberMe
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const savedUser =
        JSON.parse(localStorage.getItem("user") || "null") ||
        JSON.parse(sessionStorage.getItem("user") || "null");

      if (token && savedUser) {
        setUser(savedUser);
        setUserRole(savedUser.role || "student"); // default role
      } else {
        setUser(null);
        setUserRole(null);
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === "admin") return <Navigate to="/dashboard" replace />;
    if (userRole === "instructor")
      return <Navigate to="/instructor-dashboard" replace />;
    if (userRole === "student")
      return <Navigate to="/student-dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
