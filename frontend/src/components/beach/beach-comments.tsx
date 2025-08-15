import { lorelei } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { Ellipsis, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { CommentForm } from "../comments/comment-form";

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

export const BeachComments = () => {
  const { ref } = useSectionInView("comments", 0.5);

  return (
    <section
      ref={ref}
      id="comments"
      className="grid grid-cols-1 md:grid-cols-3"
    >
      <div>
        <div className="flex flex-row md:flex-col items-center justify-between md:justify-start md:items-start md:sticky md:top-20">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Comments</h3>
          </div>

          <div className="flex items-center md:items-start md:flex-col gap-4">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">4.6</p>
              <Star fill="black" size={18} />
              <Link to="#" className="underline underline-offset-2">
                336 reviews
              </Link>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="px-10 rounded-full"
                  variant="brand"
                  size="sm"
                >
                  Add a review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <CommentForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-8 col-span-2">
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
                        <Star size={14} fill="black" />
                        <Star size={14} fill="black" />
                        <Star size={14} fill="black" />
                        <Star size={14} fill="black" />
                        <Star size={14} fill="black" />
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
                  <Badge variant="outline" className="rounded-full" key={key}>
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

        <Button className="rounded-full px-10 mt-10" variant="brand">
          Show more
        </Button>
      </div>
    </section>
  );
};
