import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Redirect } from "wouter";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFacilitator?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireFacilitator }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  if (authLoading || userLoading) return null;
  if (!isAuthenticated) return <Redirect to="/" />;

  if (requireAdmin && user?.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  if (requireFacilitator && user?.role !== 'facilitator' && user?.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
