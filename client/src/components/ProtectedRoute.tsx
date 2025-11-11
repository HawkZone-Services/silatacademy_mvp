import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireCoach?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin,
  requireCoach,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isCoach } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }

    if (!loading && user) {
      if (requireAdmin && !isAdmin) {
        navigate("/dashboard");
      }
      if (requireCoach && !isCoach && !isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate, requireAdmin, requireCoach, isAdmin, isCoach]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requireCoach && !isCoach && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
