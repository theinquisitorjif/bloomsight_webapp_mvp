import { Outlet } from "react-router-dom";

import { useSession } from "./context/session-context";

const AuthProtectedRoute = () => {
  const { session } = useSession();
  if (!session) {
    // or you can redirect to a different page and show a message
    return <div>You are not logged in</div>;
  }
  return <Outlet />;
};

export default AuthProtectedRoute;
