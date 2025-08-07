import { Link, Outlet, useLocation } from "react-router-dom";
import { SessionProvider } from "./context/session-context";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { BellIcon } from "lucide-react";
import { Button } from "./components/ui/button";

const Providers = () => {
  const isAuthRoute = useLocation().pathname.startsWith("/auth");

  return (
    <SessionProvider>
      <header
        className={
          isAuthRoute
            ? "hidden"
            : "p-2 bg-gradient-to-r from-green-50 to-blue-100 backdrop-blur-md shadow-md"
        }
      >
        <div className="container flex items-center justify-between mx-auto ">
          <div className="flex items-center gap-18">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-only-nobg.png" alt="logo" className="h-14" />
              <h1 className="hidden md:block text-2xl font-bold text-primary/80 tracking-wide">
                Bloomsight
              </h1>
            </Link>

            {/* <nav>
              <ul className="flex items-center gap-5">
                <li>
                  <Link to="/beach">Beach</Link>
                </li>
              </ul>
            </nav> */}
          </div>

          {/* <div className="flex items-center gap-5">
            <Button variant="ghost" className="rounded-full">
              <BellIcon /> Alerts
            </Button>

            <Avatar className="size-12 bg-background">
              <AvatarImage
                src={createAvatar(lorelei, {
                  seed: "Avery",
                }).toDataUri()}
              />
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
          </div> */}
        </div>
      </header>

      <Outlet />

      <footer
        className={
          isAuthRoute
            ? "hidden"
            : "p-2 h-80 bg-gradient-to-r from-green-50 to-blue-100 backdrop-blur-md shadow-md"
        }
      >
        <div className="container mx-auto">
          <p className="text-center text-muted-foreground">
            &copy; 2023 Bloomsight
          </p>
        </div>
      </footer>
    </SessionProvider>
  );
};

export default Providers;
