import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home-page";
import Providers from "./providers";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/test",
        element: <div>test</div>,
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
