"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { OctagonAlertIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "@/supabase";
import { CustomPasswordForm } from "@/components/custom-password-form";

const formSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Password is required" }),
    name: z.string().min(1, { message: "Name is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * The SignUpPage component renders a form that allows users to create an account.
 * It displays error and success states as well as a confirmation message when the
 * email is successfully sent.
 *
 * @returns The SignUpPage component.
 */
export const SignUpPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo:
          import.meta.env.VITE_FRONTEND_URL + "/auth/verify-email",
      },
    });

    if (error) {
      setIsLoading(false);
      setError(error.message);
      return;
    }

    // User was created, email was sent by supabase
    // Notify client email was sent using this email
    if (!data.session && data.user) {
      setEmailSent(data.user.email || "");
      setIsLoading(false);
      return;
    }

    // This shouldn't happen. This would be if there was a user and a session.
    // Which can only happen if confirm email is disabled in supabase
    setError("Internal server error");
    setIsLoading(false);
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Form {...form}>
                <form
                  className="p-6 md:p-8"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">
                        Let&apos;s get started
                      </h1>
                      <p className="text-muted-foreground text-balance">
                        Create your account
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
                          Email sent to {emailSent}
                        </AlertTitle>
                      </Alert>
                    )}

                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="m@example.com"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <CustomPasswordForm />

                    <Button
                      disabled={isLoading}
                      type="submit"
                      className="w-full bg-[#4CAF50]"
                    >
                      Create account
                    </Button>

                    <div
                      className="after:border-border relative text-center text-sm after:absolute after:inset-0
                  after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
                    >
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </div>

                    <Button
                      disabled={isLoading}
                      variant="outline"
                      type="button"
                      className="w-full"
                      onClick={() => {
                        supabase.auth.signInWithOAuth({
                          provider: "google",
                        });
                      }}
                    >
                      Google
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        to="/auth/sign-in"
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>

              <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
                <img src="/logo-nobg.png" />
              </div>
            </CardContent>
          </Card>

          <div
            className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs
        text-balance *:[a]:underline *:[a]:underline-offset-4"
          >
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};
