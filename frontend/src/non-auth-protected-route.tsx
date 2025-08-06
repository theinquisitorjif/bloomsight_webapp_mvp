import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "./context/session-context";

/**
 * A route component that only renders its children when there is no active session.
 * If a session is active, it redirects the user to the home page.
 */
const NonAuthProtectedRoute = () => {
  const { session } = useSession();
  if (session) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default NonAuthProtectedRoute;
