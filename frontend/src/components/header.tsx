import { useSession } from "@/context/session-context";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import UserButton from "./user-button";
import { NavMenu } from "./nav-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu } from "lucide-react";
import BeachSearch from "./beach/beach-search";

export const Header = () => {
  const isAuthRoute = useLocation().pathname.startsWith("/auth");
  const isMobile = useIsMobile();
  const { session } = useSession();

  return (
    <header className={isAuthRoute ? "hidden" : "p-2 h-20"}>
      <div className="container flex items-center justify-between mx-auto max-w-[1000px]">
        {isMobile ? (
          <Sheet>
            <SheetTrigger>
              <Button
                variant="brand"
                className="rounded-full size-9"
                size="icon"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Bloomsight</SheetTitle>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-only-nobg.png" alt="logo" className="w-14" />
            </Link>

            <BeachSearch />

            <NavMenu />
          </div>
        )}

        {isMobile && (
          <div className="flex items-center gap-2">
            <BeachSearch />
          </div>
        )}

        {session ? (
          <UserButton />
        ) : (
          <Link to="/auth/sign-in">
            <Button variant="brand" className="rounded-full">
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};
