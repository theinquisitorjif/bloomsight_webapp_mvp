import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/session-context";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient();

const Providers = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Header />
        <Outlet />
        <Footer />
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;
