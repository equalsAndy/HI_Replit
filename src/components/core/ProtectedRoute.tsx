import { PropsWithChildren } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) return null;
  if (!isAuthenticated) {
    void loginWithRedirect();
    return null;
  }
  return <>{children}</>;
}
