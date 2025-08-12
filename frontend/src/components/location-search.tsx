"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { LocationDialog } from "./location-dialog";

export const LocationSearch = () => {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
    };
  }, []);

  return (
    <>
      <LocationDialog open={commandOpen} setOpen={setCommandOpen} />
      <nav className="flex items-center bg-background">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCommandOpen(true)}
          className="h-9 w-[320px] rounded-full justify-start font-normal text-muted-foreground hover:text-muted-foreground"
        >
          <SearchIcon />
          Search
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>
      </nav>
    </>
  );
};
