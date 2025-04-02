import { useState } from "react";
import { useLocation } from "wouter";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertContentSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AIStudio from "@/components/ai-studio";

// Extend the content schema with validation rules
const createContentSchema = insertContentSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  isPremium: z.boolean().default(false),
  mediaUrl: z.string().min(5, "Media URL is required"),
});

type CreateContentValues = z.infer<typeof createContentSchema>;

export default function Create() {
  const [activeTab, setActiveTab] = useState("ai-generation");
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Form setup
  const form = useForm<CreateContentValues>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      userId: 1, // Mock current user ID for this demo
      title: "",
      description: "",
      mediaUrl: "",
      isPremium: false,
    },
  });

  // Submit mutation
  const createContentMutation = useMutation({
    mutationFn: async (values: CreateContentValues) => {
      return await apiRequest("POST", "/api/content", values);
    },
    onSuccess: () => {
      toast({
        title: "Content created!",
        description: "Your content has been published successfully.",
      });
      navigate("/profile");
    },
    onError: (error) => {
      toast({
        title: "Error creating content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CreateContentValues) => {
    createContentMutation.mutate(values);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Create Content</h1>
      </div>

      <Tabs defaultValue="ai-generation" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="ai-generation" className="flex-1">AI Generation</TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">Upload Media</TabsTrigger>
          <TabsTrigger value="text" className="flex-1">Text Post</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generation" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-lg border border-dashed border-[#3A3A3C] p-12 text-center">
                  <WandIcon className="mx-auto h-12 w-12 text-[#AFAFAF] mb-4" />
                  <h3 className="text-xl font-medium mb-2">Create AI-Generated Content</h3>
                  <p className="text-[#AFAFAF] mb-6 max-w-md mx-auto">
                    Use our advanced AI to generate unique images for your profile. Choose characters, styles, and customize with detailed prompts.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsAIStudioOpen(true)}
                  >
                    Open AI Studio
                  </Button>
                </div>

                <div className="w-full mt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter a title for your content" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add a description or caption..." 
                                className="resize-none min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isPremium"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Premium Content</FormLabel>
                              <FormDescription>
                                Mark this content as premium for subscribers only
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Hidden field for mediaUrl, would be set by AI Studio in a real app */}
                      <FormField
                        control={form.control}
                        name="mediaUrl"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline">Cancel</Button>
                        <Button 
                          type="submit" 
                          disabled={createContentMutation.isPending}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {createContentMutation.isPending ? (
                            <>
                              <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            "Publish Content"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="rounded-lg border border-dashed border-[#3A3A3C] p-12 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-[#AFAFAF] mb-4" />
                    <h3 className="text-xl font-medium mb-2">Upload Media</h3>
                    <p className="text-[#AFAFAF] mb-6">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button type="button" variant="outline" size="lg">
                      Choose File
                    </Button>
                    <p className="text-xs text-[#AFAFAF] mt-4">
                      Supported formats: JPG, PNG, GIF, MP4, MOV
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a title for your content" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add a description or caption..." 
                            className="resize-none min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="isPremium"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Premium Content</FormLabel>
                            <FormDescription>
                              Mark this content as premium for subscribers only
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label>Content Category</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photo">Photo</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="art">Digital Art</SelectItem>
                          <SelectItem value="animation">Animation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">Cancel</Button>
                    <Button 
                      type="submit" 
                      disabled={createContentMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createContentMutation.isPending ? (
                        <>
                          <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        "Publish Content"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a title for your post" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your post content here..." 
                            className="resize-none min-h-[200px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <Label>Post Visibility</Label>
                    <RadioGroup defaultValue="public">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public">Public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="subscribers" id="subscribers" />
                        <Label htmlFor="subscribers">Subscribers Only</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">Cancel</Button>
                    <Button 
                      type="submit" 
                      disabled={createContentMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createContentMutation.isPending ? (
                        <>
                          <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        "Publish Post"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Studio Modal */}
      <AIStudio open={isAIStudioOpen} onClose={() => setIsAIStudioOpen(false)} />
    </div>
  );
}

function WandIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m21.64 3.64-1.28-1.28a1.08 1.08 0 0 0-1.52 0L2.36 18.36a1.08 1.08 0 0 0 0 1.52l1.28 1.28c.42.42 1.1.42 1.52 0L21.64 5.16a1.08 1.08 0 0 0 0-1.52Z"></path>
      <path d="m14 7 3 3"></path>
      <path d="M5 6v4"></path>
      <path d="M19 14v4"></path>
      <path d="M10 2v2"></path>
      <path d="M7 8H3"></path>
      <path d="M21 16h-4"></path>
      <path d="M11 3H9"></path>
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
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
