import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Submit mutation
  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      return await apiRequest("POST", "/api/auth/login", values);
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <Card className="w-full max-w-md bg-[#2C2C2E] border-[#3A3A3C]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <div className="text-primary font-bold text-3xl">OnlyAI</div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center text-[#AFAFAF]">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        className="bg-[#1E1E1E] border-[#3A3A3C]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Enter your password" 
                          className="bg-[#1E1E1E] border-[#3A3A3C] pr-10" 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-[#AFAFAF] hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-[#3A3A3C] bg-[#1E1E1E]"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium text-[#AFAFAF]"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:text-primary/90"
                >
                  Forgot password?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#3A3A3C]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#2C2C2E] px-2 text-[#AFAFAF]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-[#3A3A3C]">
                <GoogleIcon className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="border-[#3A3A3C]">
                <TwitterIcon className="mr-2 h-4 w-4" />
                Twitter
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1">
          <div className="text-sm text-[#AFAFAF]">Don't have an account?</div>
          <Link href="/register">
            <a className="text-sm font-medium text-primary hover:text-primary/90">
              Sign up now
            </a>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12.545 12.151c0 .866-.693 1.55-1.577 1.55-.885 0-1.601-.684-1.601-1.55 0-.866.716-1.55 1.601-1.55.884 0 1.577.684 1.577 1.55zm-1.577 4.11c-2.366 0-4.28-1.86-4.28-4.11s1.914-4.11 4.28-4.11c1.104 0 2.025.352 2.706.95l-.965.925c-.43-.407-1.02-.65-1.742-.65-1.495 0-2.678 1.185-2.678 2.885 0 1.7 1.183 2.885 2.678 2.885.915 0 1.56-.353 1.924-.919.226-.347.357-.762.385-1.192h-2.309V11.18h3.86c.042.196.061.4.061.612 0 .89-.241 1.933-.992 2.662-.736.723-1.7 1.131-2.922 1.131V16.29l.03-.029z"
      ></path>
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
      ></path>
    </svg>
  );
}

function LoadingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
