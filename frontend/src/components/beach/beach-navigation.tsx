import { useActiveSectionContext } from "@/hooks/use-section-in-view";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";

const NavLinks = [
  { name: "Overview", href: "#overview" },
  { name: "Conditions", href: "#conditions" },
  { name: "Algae", href: "#algae" },
  { name: "Parking", href: "#parking" },
  { name: "Reports", href: "#reports" },
  { name: "Comments", href: "#comments" },
];

export const BeachNavigation = () => {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      // @ts-expect-error This is ok pls ignore
      const { top } = navRef.current.getBoundingClientRect();
      setIsSticky(top <= 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={clsx(
        "overflow-x-auto border-t flex gap-10 border-border w-full mt-10 pb-4 sticky top-0 bg-background z-10 transition-shadow",
        isSticky && "shadow-lg border-b border-t-0 border-border"
      )}
    >
      {NavLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className={clsx(
            "pt-2 font-medium",
            activeSection === link.href.slice(1) &&
              "font-semibold border-t-3 border-primary"
          )}
          onClick={() => {
            setActiveSection(link.href.slice(1));
            setTimeOfLastClick(Date.now());
          }}
        >
          {link.name}
        </a>
      ))}
    </nav>
  );
};
