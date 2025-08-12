import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home-page";
import Providers from "./providers";
import AuthProtectedRoute from "./auth-protected-route";
import { SignInPage } from "./pages/auth/sign-in-page";
import { SignUpPage } from "./pages/auth/sign-up-page";
import NonAuthProtectedRoute from "./non-auth-protected-route";
import { ForgotPasswordPage } from "./pages/auth/forgot-password-page";
import { ResetPasswordPage } from "./pages/auth/reset-password-page";
import { VerifyEmailPage } from "./pages/auth/verify-email-page";
import { Button } from "./components/ui/button";
import supabase from "./supabase";
import { BeachPage } from "./pages/beach-page";

const authRoutes = [
  {
    path: "/auth/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPasswordPage />,
  },
];

const protectedRoutes = [
  {
    path: "/auth/reset-password", // Supabase logs the user in when they click link
    element: <ResetPasswordPage />,
  },
  {
    path: "/auth/verify-email", // Supabase logs the user in when they click link
    element: <VerifyEmailPage />,
  },
  {
    path: "/protected",
    element: (
      <div>
        can't access this foo!{" "}
        <Button onClick={() => supabase.auth.signOut()}>Logout</Button>
      </div>
    ),
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      /** Routes that can be accessed by both authenticated and non-authenticated users */
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/beach",
        element: <BeachPage />,
      },
      /** Routes that only non-authenticated users can access */
      {
        path: "/",
        element: <NonAuthProtectedRoute />,
        children: authRoutes,
      },
      /** Routes that only authenticated users can access */
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: protectedRoutes,
      },
    ],
  },
  {
    path: "*",
    element: <div>Not found</div>, // Catch all route
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
