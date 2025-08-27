import { useGetAccountComments } from "@/api/account";
import Comments from "@/components/comments/comments";
import PageContainer from "@/components/page-container";
import PageTitle from "@/components/page-title";
import { Loader2 } from "lucide-react";

const UserCommentsPage = () => {
  const commentsQuery = useGetAccountComments();

  console.log(commentsQuery.data);

  return (
    <PageContainer>
      <PageTitle>Your comments</PageTitle>
      <div className="space-y-2 mt-8">
        {commentsQuery.isPending ? (
          <Loader2 className="animate-spin" />
        ) : commentsQuery.error ? (
          <div>Error loading comments</div>
        ) : commentsQuery.isSuccess && commentsQuery.data.length > 0 ? (
          <Comments comments={commentsQuery.data} />
        ) : (
          <img
            src="/comments-empty.png"
            alt="No comments"
            className="w-80 mx-auto md:-my-10"
          />
        )}
      </div>
    </PageContainer>
  );
};

export default UserCommentsPage;
