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
import { Link, useNavigate } from "react-router-dom";
import supabase from "@/supabase";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password is required" }),
});

/**
 * The SignInPage component renders a sign-in form that allows users to log in to
 * their Bloomsight account. The form requires an email address and password.
 *
 * Upon submission, the component will attempt to sign the user in using Supabase's
 * `signInWithPassword` method. If the sign-in is successful, the user will be
 * redirected to the root route.
 *
 * If the user does not have an account, they can click the "Sign up" link to be
 * taken to the sign-up page.
 *
 * @returns The SignInPage component.
 */
export const SignInPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setIsLoading(false);
      setError(error.message);
    } else {
      setIsLoading(false);
      navigate("/");
    }
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
                      <h1 className="text-2xl font-bold">Welcome back</h1>
                      <p className="text-muted-foreground text-balance">
                        Login to your account
                      </p>
                    </div>

                    {!!error && (
                      <Alert className="bg-destructive/10 border-none">
                        <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                        <AlertTitle className="text-destructive">
                          {error}
                        </AlertTitle>
                      </Alert>
                    )}

                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="hello@example.com"
                                type="email"
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
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Password</FormLabel>
                              <Link
                                to="/auth/forgot-password"
                                className="text-sm text-muted-foreground hover:underline"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="••••••••"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      disabled={isLoading}
                      type="submit"
                      className="w-full bg-[#4CAF50]"
                    >
                      Sign in
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
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/auth/sign-up"
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Sign up
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
