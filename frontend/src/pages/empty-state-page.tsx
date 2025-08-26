import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EmptyStatePage = ({
  description = "Page not found",
}: {
  description?: string;
}) => {
  return (
    <div className="flex flex-col items-center pt-10 pb-20">
      <main className="container p-2 xl:max-w-[1000px] space-y-4 flex min-h-[70vh] flex-col items-center justify-center">
        <img src="/404.png" alt="Not Found" className="w-1/3" />
        <p className="text-2xl font-semibold text-primary/90">{description}</p>
        <Link to="/">
          <Button variant="brand" size="lg" className="text-lg py-8 mt-4 px-12">
            Back to home
          </Button>
        </Link>
      </main>
    </div>
  );
};

export default EmptyStatePage;
