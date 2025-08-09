import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/session-context";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

const Providers = () => {
  return (
    <SessionProvider>
      <Header />
      <Outlet />
      <Footer />
    </SessionProvider>
  );
};

export default Providers;
