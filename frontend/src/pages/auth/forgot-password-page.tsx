import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import supabase from "@/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";

const formSchema = z.object({
  email: z.email(),
});

/**
 * The ForgotPasswordPage component renders a form that allows users to request
 * a password reset email. Users must enter their email address, and upon submission,
 * a password reset link will be sent to the provided email if it exists in the system.
 *
 * The component displays loading and error states as well as a confirmation message
 * when the email is successfully sent.
 *
 * @returns The ForgotPasswordPage component.
 */
export const ForgotPasswordPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: import.meta.env.VITE_FRONTEND_URL + "/auth/reset-password",
    });

    if (error) {
      setError(error.message);
    } else {
      setEmailSent(true);
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
                        Enter your email address and we will send you a link to
                        reset your password
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

                    {emailSent && (
                      <Alert className="bg-green-500/10 border-none">
                        <OctagonAlertIcon className="h-4 w-4 !text-green-500" />
                        <AlertTitle className="text-green-500">
                          Password reset link sent to {form.getValues("email")}
                        </AlertTitle>
                      </Alert>
                    )}

                    <FormField
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Enter Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      disabled={isLoading}
                      type="submit"
                      className="w-full"
                    >
                      Send Reset Link
                    </Button>

                    <div className="flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Don&apos;t have an account?{" "}
                        <a
                          href="/auth/sign-up"
                          className="text-primary hover:underline"
                        >
                          Sign Up
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
