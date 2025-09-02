import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Redirect } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return null; // or your spinner
  if (!isAuthenticated) return <Redirect to="/auth" />;
  return <>{children}</>;
}
