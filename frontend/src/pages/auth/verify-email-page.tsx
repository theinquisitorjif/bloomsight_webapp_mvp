import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * The VerifyEmailPage component is the page that a user will see after they click
 * on the verification link sent to their email address. It is a simple page that
 * displays a success message and a link back to the home page.
 *
 * @returns The VerifyEmailPage component.
 */
export const VerifyEmailPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Verify Email</h1>
                <p className="text-muted-foreground text-balance">
                  Verifying your email allows you to sign in to Bloomsight
                </p>
              </div>

              <Alert className="my-4">
                <CheckCircle />
                <AlertTitle>Your email has been verified</AlertTitle>
                <AlertDescription>Welcome to Bloomsight</AlertDescription>
              </Alert>

              <Link to="/">
                <Button className="w-full">Back to home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
