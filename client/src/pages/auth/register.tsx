import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { insertUserSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Extend the user schema with additional validation
const registerSchema = insertUserSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  email: z.string().email("Please enter a valid email address"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Omit terms from the type as it's not part of the API
type RegisterFormValues = Omit<z.infer<typeof registerSchema>, "terms" | "confirmPassword">;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [creatorAccount, setCreatorAccount] = useState(false);

  // Form setup
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      displayName: "",
      terms: false,
      isCreator: false,
    },
  });

  // Submit mutation
  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      return await apiRequest("POST", "/api/auth/register", values);
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      navigate("/login");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    // Remove confirm password and terms from submission
    const { confirmPassword, terms, ...registrationData } = values;
    
    // Set creator status from state
    registrationData.isCreator = creatorAccount;
    
    // If creator, set default subscription price
    if (creatorAccount) {
      registrationData.subscriptionPrice = 999; // $9.99
    }
    
    registerMutation.mutate(registrationData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 py-12">
      <Card className="w-full max-w-lg bg-[#2C2C2E] border-[#3A3A3C]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <div className="text-primary font-bold text-3xl">OnlyAI</div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center text-[#AFAFAF]">
            Enter your details to create your OnlyAI account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your display name" 
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Choose a username" 
                          className="bg-[#1E1E1E] border-[#3A3A3C]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Used for login and your profile URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email address" 
                        className="bg-[#1E1E1E] border-[#3A3A3C]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder="Create a password" 
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Confirm your password" 
                          className="bg-[#1E1E1E] border-[#3A3A3C]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="creator" 
                    checked={creatorAccount}
                    onCheckedChange={(checked) => setCreatorAccount(checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="creator"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I want to create and sell AI-generated content
                  </label>
                </div>

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the{" "}
                          <a href="#" className="text-primary hover:text-primary/90 underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:text-primary/90 underline">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1">
          <div className="text-sm text-[#AFAFAF]">Already have an account?</div>
          <Link href="/login">
            <a className="text-sm font-medium text-primary hover:text-primary/90">
              Sign in instead
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
