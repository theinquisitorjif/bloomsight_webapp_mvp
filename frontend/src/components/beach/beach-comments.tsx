import { Ellipsis, Loader2, Star, Trash } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useSectionInView } from "@/hooks/use-section-in-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { CommentForm } from "../comments/comment-form";
import { useSession } from "@/context/session-context";
import {
  useDeleteCommentByBeachID,
  useGetCommentsByBeachID,
  useGetReviewsByBeachID,
} from "@/api/beach";
import { GeneratedAvatar } from "../generated-avatar";
import { TiStar } from "react-icons/ti";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";

export const BeachComments = ({ beachId }: { beachId: number }) => {
  const { ref } = useSectionInView("comments", 0.5);
  const page = useParams().page;
  const { session } = useSession();
  const navigate = useNavigate();
  const commentsQuery = useGetCommentsByBeachID(beachId, parseInt(page || "1"));
  const reviewsQuery = useGetReviewsByBeachID(beachId);
  const deleteCommentQuery = useDeleteCommentByBeachID(beachId);

  const [commentOpen, setCommentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

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
            {reviewsQuery.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">
                  {reviewsQuery.data?.overall_rating}
                </p>
                <Star fill="black" size={18} />
                <Link to="#" className="underline underline-offset-2">
                  {reviewsQuery.data?.number_of_reviews} reviews
                </Link>
              </div>
            )}

            <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
              <Button
                className="px-10 rounded-full"
                variant="brand"
                size="sm"
                onClick={() => {
                  if (!session) {
                    navigate("/auth/sign-in");
                  } else {
                    setCommentOpen(true);
                  }
                }}
              >
                Add a review
              </Button>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="sr-only">Add a review</DialogTitle>
                  <DialogDescription className="sr-only">
                    Add a review for this beach
                  </DialogDescription>
                </DialogHeader>
                <CommentForm
                  beachId={beachId}
                  setCommentOpen={setCommentOpen}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-8 col-span-2">
        {commentsQuery.isPending ? (
          <Loader2 className="animate-spin" />
        ) : commentsQuery.error ? (
          <div>Error loading comments</div>
        ) : (
          commentsQuery.isSuccess &&
          commentsQuery.data.comments.map((comment, key) => {
            return (
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
                    onOpenChange={(open) =>
                      setDeleteDialogOpen(open ? comment.id : null)
                    }
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

                {key !== commentsQuery.data.comments.length - 1 && (
                  <Separator className="my-8" />
                )}
              </div>
            );
          })
        )}

        {commentsQuery.data?.comments.length === 0 && (
          <h3 className="text-lg tracking-tight">
            No comments. Be the first to comment!
          </h3>
        )}
      </div>
    </section>
  );
};
