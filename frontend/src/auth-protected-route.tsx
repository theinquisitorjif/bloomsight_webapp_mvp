import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "./context/session-context";

/**
 * A route component that only renders its children when there is an active session.
 * If no session is active, it redirects the user to the sign-in page.
 */
const AuthProtectedRoute = () => {
  const { session } = useSession();
  if (!session) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return <Outlet />;
};

export default AuthProtectedRoute;
