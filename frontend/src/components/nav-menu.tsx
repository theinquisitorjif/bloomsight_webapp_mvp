"use client";

import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

export const NavMenu = () => {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
          <NavigationMenuContent className="z-[1000]">
            <ul className="grid gap-2 w-[250px]">
              <ListItem href="/beaches" title="Map">
                Explore new beaches
              </ListItem>
              <ListItem href="/safety" title="Safety">
                Learn how to keep yourself safe
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger>About</NavigationMenuTrigger>
          <NavigationMenuContent className="z-[1000]">
            <ul className="grid gap-2 w-[250px]">
              <ListItem href="/team" title="Team">
                Learn more about our team
              </ListItem>
              <ListItem href="/contact" title="Contact">
                Having issues? Contact us
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem> */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Policy</NavigationMenuTrigger>
          <NavigationMenuContent className="z-[1000]">
            <ul className="grid gap-2 w-[250px]">
              <ListItem href="/privacy" title="Privacy Policy">
                Learn more about our privacy policy
              </ListItem>
              <ListItem href="/terms" title="Terms & Conditions">
                Learn more about our terms and conditions
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

function ListItem({
  title,
  children,
  href,
  imgSrc,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; imgSrc?: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={href}>
          {imgSrc && (
            <img
              src={imgSrc}
              className="h-30 w-full rounded-sm mb-2 object-cover"
            />
          )}
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
