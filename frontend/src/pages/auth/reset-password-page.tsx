import {
  CustomPasswordForm,
  NewPasswordSchema,
} from "@/components/custom-password-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import supabase from "@/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";

/**
 * The ResetPasswordPage component is the page that a user will see when they click
 * on the "Forgot Password" link. It is a form that allows the user to enter a new
 * password.
 *
 * @returns The ResetPasswordPage component.
 */
export const ResetPasswordPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState<boolean>(false);
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof NewPasswordSchema>) => {
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setError(error.message);
    } else {
      setPasswordReset(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-0">
              <Form {...form}>
                <form
                  className="p-6 md:p-8"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Reset Password</h1>
                      <p className="text-muted-foreground text-balance">
                        Enter your new password
                      </p>
                    </div>

                    {error && (
                      <Alert className="bg-destructive/10 border-none">
                        <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                        <AlertTitle className="text-destructive">
                          {error}
                        </AlertTitle>
                      </Alert>
                    )}

                    {passwordReset && (
                      <Alert className="bg-green-500/10 border-none">
                        <OctagonAlertIcon className="h-4 w-4 !text-green-500" />
                        <AlertTitle className="text-green-500">
                          Password reset successfully
                        </AlertTitle>
                      </Alert>
                    )}

                    <CustomPasswordForm />

                    <Button
                      disabled={isLoading}
                      type="submit"
                      className="w-full"
                    >
                      Reset Password
                    </Button>

                    <div className="flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Go back to{" "}
                        <a href="/" className="text-primary hover:underline">
                          Home
                        </a>
                      </p>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
