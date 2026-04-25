import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";
import { ReactNode } from "react";

export const ProtectedRoute = ({ children, role }: { children: ReactNode; role?: Role }) => {
  const { user, loading } = useAuth();

  // While JWT is being verified with the server, render nothing (avoid flash redirect)
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};
