import type { CommentAPIResponse } from "@/types/comment";
import { Ellipsis, Loader2, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GeneratedAvatar } from "./generated-avatar";
import { TiStar } from "react-icons/ti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { useDeleteCommentByCommentID } from "@/api/beach";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";

const Comments = ({
  comments,
}: {
  comments: CommentAPIResponse["comments"];
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const deleteCommentQuery = useDeleteCommentByCommentID();

  const { session } = useSession();

  return comments.map((comment, key) => (
    <div key={key}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {comment.user.picture ? (
            <Avatar className="size-12">
              <AvatarImage src={comment.user.picture || ""} />
              <AvatarFallback>
                {comment.user.name || comment.user.email}
              </AvatarFallback>
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={comment.user.name || "B"}
              className="size-12 mr-3"
            />
          )}

          <div>
            <p className="font-medium">{comment.user.name}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <TiStar
                  size={20}
                  className={
                    comment.rating >= 1
                      ? "text-primary"
                      : " text-muted-foreground/30"
                  }
                />
                <TiStar
                  size={20}
                  className={
                    comment.rating >= 2
                      ? "text-primary"
                      : " text-muted-foreground/30"
                  }
                />
                <TiStar
                  size={20}
                  className={
                    comment.rating >= 3
                      ? "text-primary"
                      : " text-muted-foreground/30"
                  }
                />
                <TiStar
                  size={20}
                  className={
                    comment.rating >= 4
                      ? "text-primary"
                      : " text-muted-foreground/30"
                  }
                />
                <TiStar
                  size={20}
                  className={
                    comment.rating >= 5
                      ? "text-primary"
                      : " text-muted-foreground/30"
                  }
                />
              </div>
              <time className="text-xs text-muted-foreground">
                {new Date(comment.timestamp).toDateString()}
              </time>
            </div>
          </div>
        </div>

        <Dialog
          open={deleteDialogOpen === comment.id}
          onOpenChange={(open) => setDeleteDialogOpen(open ? comment.id : null)}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button variant="ghost" size="icon">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72">
              {session?.user.id === comment.user.id && (
                <DialogTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                    Delete <Trash />
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to
                permanently delete this comment?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (!session) {
                    return;
                  }
                  deleteCommentQuery
                    .mutateAsync(parseInt(comment.id))
                    .then(() => {
                      setDeleteDialogOpen(null);
                      toast.success("Comment deleted successfully!");
                    })
                    .catch(() => {
                      toast.error("Error deleting comment");
                    });
                }}
                variant="destructive"
                disabled={deleteCommentQuery.isPending}
              >
                Confirm{" "}
                {deleteCommentQuery.isPending && (
                  <Loader2 className="animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center flex-wrap gap-2 my-2">
        {(comment.conditions ?? "")
          .split(",")
          .filter(Boolean)
          .map((tag, key) => (
            <Badge variant="outline" className="rounded-full" key={key}>
              {tag}
            </Badge>
          ))}
      </div>

      <p className="leading-relaxed">{comment.content}</p>

      <div className="flex items-center gap-4 mt-5">
        {comment.pictures.map((picture, key) => (
          <img
            key={key}
            src={picture}
            width={120}
            height={120}
            className="object-cover rounded-lg aspect-square"
            alt="Comment picture"
          />
        ))}
      </div>

      {key !== comments.length - 1 && <Separator className="my-8" />}
    </div>
  ));
};

export default Comments;
