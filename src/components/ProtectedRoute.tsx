import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";
import { ReactNode } from "react";

export const ProtectedRoute = ({ children, role }: { children: ReactNode; role?: Role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};
