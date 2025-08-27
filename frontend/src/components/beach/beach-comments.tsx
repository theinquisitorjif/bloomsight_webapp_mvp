import { Loader2, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { useSectionInView } from "@/hooks/use-section-in-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { CommentForm } from "../comments/comment-form";
import { useSession } from "@/context/session-context";
import { useGetCommentsByBeachID, useGetReviewsByBeachID } from "@/api/beach";
import { useState } from "react";
import Comments from "../comments";

export const BeachComments = ({ beachId }: { beachId: number }) => {
  const { ref } = useSectionInView("comments", 0.5);
  const page = useParams().page;
  const { session } = useSession();
  const navigate = useNavigate();
  const commentsQuery = useGetCommentsByBeachID(beachId, parseInt(page || "1"));
  const reviewsQuery = useGetReviewsByBeachID(beachId);

  const [commentOpen, setCommentOpen] = useState(false);

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
                  {reviewsQuery.data?.number_of_reviews}{" "}
                  {reviewsQuery.data?.number_of_reviews === 1
                    ? "review"
                    : "reviews"}
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
          commentsQuery.isSuccess && (
            <Comments comments={commentsQuery.data.comments} />
          )
        )}

        {commentsQuery.data?.comments.length === 0 && (
          <img
            src="/comments-empty.png"
            alt="No comments"
            className="w-80 mx-auto md:-my-10"
          />
        )}
      </div>
    </section>
  );
};
