import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WeatherForecast from "@/components/weather/weather-forecast";
import clsx from "clsx";
import {
  BookmarkIcon,
  CarIcon,
  Check,
  Ellipsis,
  ImageIcon,
  MapPinIcon,
  ShareIcon,
  StarIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const commentsTest = [
  {
    author: "Kayla Parker",
    avatar: createAvatar(lorelei, {
      seed: "Jameson",
    }),
    rating: 4,
    date: new Date(),
    tags: ["Good conditions", "Bathrooms available"],
    content:
      "I didn’t see anyone mention - reservations required to get in, must be made online and there is limited availability. Car line to get in was 25 minutes at opening and they do recommend you get there when it opens.Like others said there were hardly any people on the trail itself which was awesome. Buggy but I got hit in the face with more bugs than actual bites. Started off with some cloud coverage so the heat wasn’t bad but towards the end the sun came out and I was feeling it! I would actually never come back here for the springs because there were SO MANY PEOPLE it was anxiety inducing. I did get in but just to rinse off/cool off to go home. Rec the trail just not the springs.",
  },
  {
    author: "Hideko Masuoka",
    avatar: createAvatar(lorelei, {
      seed: "Avery",
    }),
    rating: 4,
    date: new Date(),
    tags: ["Not crowded"],
    content:
      "Easy to walk! It says 5.3 miles, I believe, but close to 6 miles!",
  },
  {
    author: "Ryan Tanner",
    avatar: createAvatar(lorelei, {
      seed: "Aidan",
    }),
    rating: 4,
    date: new Date(),
    tags: ["Fair conditions"],
    content:
      "A bit hard to follow, crossing vehicle trails several times. But nice walk through the shaded forest.",
  },
];

export const BeachPage = () => {
  const [activeSection, setActiveSection] = useState("Overview");

  return (
    <div className="flex flex-col items-center py-20">
      <main className="container p-2 xl:max-w-[1000px] space-y-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="underline underline-offset-2">
            Back to explore
          </Link>

          <span className="opacity-50">|</span>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">United States</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">California</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Carlsbad Beach</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-6 gap-4 h-[340px] relative">
          <img
            src="/beach-1.jpg"
            className="w-full h-[340px] rounded-lg md:rounded-l-lg md:rounded-r-none col-span-6 md:col-span-4"
          />

          <div className="hidden md:flex col-span-2 h-[340px] flex-col gap-4">
            <img
              src="/beach-2.jpg"
              className="w-full object-cover rounded-tr-lg rounded-br-none rounded-l-none h-[calc(50%-8px)]"
            />

            <img
              src="/beach-3.webp"
              className="w-full object-cover rounded-br-lg rounded-tr-none rounded-l-none h-[calc(50%-8px)]"
            />
          </div>

          <Button className="absolute bottom-4 left-4" variant="outline">
            <ImageIcon /> 132 photos
          </Button>
        </div>

        <div className="flex justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight">
              Carlsbad Beach
            </h1>
            <div className="flex-col sm:flex-row flex sm:items-center gap-4">
              <div className="flex items-center gap-2">
                4.6
                <StarIcon fill="black" size={18} />
                <Link to="#" className="underline underline-offset-2">
                  336 reviews
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <MapPinIcon size={18} />
                <p>Carlsbad, CA</p>
              </div>

              <Badge variant="outline" className="bg-green-50 rounded-full">
                Good Conditions <Check />
              </Badge>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-4">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  className="rounded-full size-14 cursor-pointer"
                >
                  <BookmarkIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bookmark Beach</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  className="rounded-full size-14 cursor-pointer"
                >
                  <ShareIcon className="size-5" />
                </Button>
                <TooltipContent>Share Beach</TooltipContent>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  className="rounded-full size-14 cursor-pointer"
                >
                  <CarIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Directions</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <nav className="border-t flex gap-10 border-border w-full my-10 sticky top-0 bg-background z-10">
          <Link
            to="#overview"
            className={clsx(
              "pt-2 font-medium",
              activeSection == "Overview" &&
                "font-semibold border-t-3 border-primary -translate-y-0.5"
            )}
            onClick={() => setActiveSection("Overview")}
          >
            Overview
          </Link>
          <Link
            to="#comments"
            className={clsx(
              "pt-2 font-medium",
              activeSection == "Comments" &&
                "font-semibold border-t-3 border-primary -translate-y-0.5"
            )}
            onClick={() => setActiveSection("Comments")}
          >
            Comments
          </Link>
          <Link
            to="#safety"
            className={clsx(
              "pt-2 font-medium",
              activeSection == "Safety" &&
                "font-semibold border-t-3 border-primary -translate-y-0.5"
            )}
            onClick={() => setActiveSection("Safety")}
          >
            Safety
          </Link>
        </nav>

        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-lg font-semibold mt-6">something goes here</p>
          </div>
          <WeatherForecast />
        </div>

        <Separator className="my-10" />

        <section id="comments">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Comments
              </h2>
              <p>See what others say about this place</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">4.6</p>
                <StarIcon fill="black" size={18} />
                <Link to="#" className="underline underline-offset-2">
                  336 reviews
                </Link>
              </div>
              <Button className="px-10 rounded-full" size="sm">
                Add a review
              </Button>
            </div>
          </div>

          <div className="space-y-2 mt-8">
            {commentsTest.map((comment, key) => {
              return (
                <div key={key}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="size-18">
                        <AvatarImage src={comment.avatar.toDataUri()} />
                        <AvatarFallback>{comment.author}</AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <p>{comment.author}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <StarIcon size={14} fill="black" />
                            <StarIcon size={14} fill="black" />
                            <StarIcon size={14} fill="black" />
                            <StarIcon size={14} fill="black" />
                            <StarIcon size={14} fill="black" />
                          </div>
                          <time className="text-xs text-muted-foreground">
                            {comment.date.toDateString()}
                          </time>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon">
                      <Ellipsis />
                    </Button>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    {comment.tags.map((tag, key) => (
                      <Badge
                        variant="outline"
                        className="rounded-full"
                        key={key}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="leading-relaxed">{comment.content}</p>

                  {key !== commentsTest.length - 1 && (
                    <Separator className="my-8" />
                  )}
                </div>
              );
            })}

            <Button className="rounded-full px-10 mt-10" variant="outline">
              Show more
            </Button>
          </div>
        </section>

        <Separator className="my-10" />

        <section id="safety">
          <h2 className="text-2xl font-semibold tracking-tight">
            Safety Guidance
          </h2>
          <p>How to keep yourself and Florida safe anywhere and all the time</p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Badge className="p-4 w-full" variant="outline">
              Safety info about red tide
            </Badge>
            <Badge className="p-4 w-full" variant="outline">
              How to keep beaches clean
            </Badge>
            <Badge className="p-4 w-full" variant="outline">
              Safety info about the beach
            </Badge>
            <Badge className="p-4 w-full" variant="outline">
              Where to report things like red tide
            </Badge>
            <Badge className="p-4 w-full" variant="outline">
              Info on Animal mating seasons
            </Badge>
            <Badge className="p-4 w-full" variant="outline">
              Who to call in case of emergencies
            </Badge>
          </div>
        </section>
      </main>
    </div>
  );
};
