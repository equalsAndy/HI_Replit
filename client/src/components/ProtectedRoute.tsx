import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Redirect } from "wouter";
import { useCurrentUser } from "@/hooks/use-current-user";

type Workshop = 'ast' | 'ia' | 'pm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFacilitator?: boolean;
  /** Require access to a specific workshop. Users without the matching access
   *  flag are redirected to a workshop they can access (never silently let in). */
  requireWorkshop?: Workshop;
}

/** Pick a safe destination for a user denied a workshop: their only workshop,
 *  the selector if they have several, or the landing page if none. Mirrors the
 *  post-login routing in AuthCallback so behavior stays consistent. */
function fallbackDestination(user: { astAccess?: boolean; iaAccess?: boolean; pmAccess?: boolean } | undefined): string {
  const available = [
    user?.astAccess && '/allstarteams',
    user?.iaAccess && '/imaginal-agility',
    user?.pmAccess && '/product-mindset',
  ].filter(Boolean) as string[];

  if (available.length === 1) return available[0];
  if (available.length > 1) return '/workshop-selection';
  return '/';
}

export function ProtectedRoute({ children, requireAdmin, requireFacilitator, requireWorkshop }: ProtectedRouteProps) {
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

  // Workshop-level access enforcement. Admins/facilitators bypass so they can
  // view any workshop; participants must hold the matching access flag.
  if (requireWorkshop && user?.role !== 'admin' && user?.role !== 'facilitator') {
    const accessByWorkshop: Record<Workshop, boolean | undefined> = {
      ast: user?.astAccess,
      ia: user?.iaAccess,
      pm: user?.pmAccess,
    };
    if (!accessByWorkshop[requireWorkshop]) {
      return <Redirect to={fallbackDestination(user)} />;
    }
  }

  return <>{children}</>;
}
