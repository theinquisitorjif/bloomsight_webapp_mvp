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
import { BeachPage } from "./pages/beach-page";
import { LandingPage } from "./pages/landing-page";
import SafetyPage from "./pages/safety-page";
import PrivacyPolicyPage from "./pages/privacy-policy";
import TermsPage from "./pages/terms-page";
import EmptyStatePage from "./pages/empty-state-page";
import SettingsPage from "./pages/settings-page";

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
    path: "/settings",
    element: <SettingsPage />,
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      /** Routes that can be accessed by both authenticated and non-authenticated users */
      {
        path: "/beaches",
        element: <HomePage />,
      },
      {
        path: "/beaches/:id",
        element: <BeachPage />,
      },
      {
        path: "/safety",
        element: <SafetyPage />,
      },
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "/terms",
        element: <TermsPage />,
      },
      {
        path: "/*", // Catch all route
        element: <EmptyStatePage />,
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
