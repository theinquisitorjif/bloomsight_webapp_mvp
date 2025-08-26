import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/session-context";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient();

const Providers = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {/** Backgroun gradient colors */}
        <div
          className="pointer-events-none fixed top-0 right-0 z-[-2] h-[700px] w-[700px]
          bg-[radial-gradient(110%_60%_at_70%_20%,rgba(0,163,255,0.1)_0%,rgba(0,163,255,0)_70%)]
          dark:bg-[radial-gradient(110%_60%_at_70%_20%,rgba(0,163,255,0.15)_0%,rgba(0,163,255,0)_80%)]"
        ></div>
        <div
          className="pointer-events-none fixed top-0 left-0 z-[-2] h-[700px] w-[700px] 
          bg-[radial-gradient(110%_60%_at_20%_20%,rgba(50,205,50,0.1)_0%,rgba(50,205,50,0)_70%)] 
          dark:bg-[radial-gradient(110%_60%_at_20%_20%,rgba(50,205,50,0.15)_0%,rgba(50,205,50,0)_80%)]"
        ></div>

        <div
          className="absolute inset-0 h-full w-full bg-background z-[-3]
             bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]
             [background-size:16px_16px]
             [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_60%,transparent_100%)]
         "
        ></div>

        <Header />
        <Outlet />
        <Footer />
        <Toaster richColors position="bottom-right" closeButton />
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;
