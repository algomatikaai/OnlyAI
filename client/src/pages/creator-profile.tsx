import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useCreatorProfile, useCreatorContent } from "@/hooks/use-creator-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import ContentCard from "@/components/content-card";
import PostCard from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { Content } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const { data: creator, isLoading: isCreatorLoading } = useCreatorProfile(username || "");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  
  // Only fetch content if we have the creator
  const { 
    data: creatorContent, 
    isLoading: isContentLoading 
  } = useCreatorContent(creator?.id || 0);

  // Filtered content based on tabs
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);

  // Update filtered content when the tab changes or when content loads
  useEffect(() => {
    if (!creatorContent) return;
    
    if (activeTab === "posts") {
      setFilteredContent(creatorContent);
    } else if (activeTab === "photos") {
      setFilteredContent(creatorContent.filter(c => c.mediaUrl.endsWith('.jpg') || c.mediaUrl.endsWith('.png')));
    } else if (activeTab === "videos") {
      setFilteredContent(creatorContent.filter(c => c.mediaUrl.endsWith('.mp4') || c.mediaUrl.endsWith('.mov')));
    }
  }, [activeTab, creatorContent]);

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!creator) return;
      
      await apiRequest("POST", "/api/subscriptions", {
        userId: 1, // Mock current user ID
        creatorId: creator.id,
        price: creator.subscriptionPrice,
        status: "active"
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: `You've successfully subscribed to ${creator?.displayName}.`,
      });
    },
    onError: () => {
      toast({
        title: "Subscription failed",
        description: "There was an error processing your subscription.",
        variant: "destructive",
      });
    }
  });

  if (isCreatorLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-[#2C2C2E] rounded-xl overflow-hidden mb-8">
          {/* Cover Image Skeleton */}
          <div className="h-48 bg-[#3A3A3C] animate-pulse relative"></div>
          
          {/* Profile Info Skeleton */}
          <div className="mt-16 px-6 pb-6">
            <div className="flex items-center">
              <Skeleton className="h-7 w-40" />
              <div className="ml-auto">
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
            <Skeleton className="h-20 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Creator Not Found</h2>
          <p className="text-[#AFAFAF]">The creator you're looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Creator Profile Card */}
      <div className="bg-[#2C2C2E] rounded-xl overflow-hidden mb-8">
        {/* Cover Image */}
        <div className="h-48 bg-[#3A3A3C] relative">
          {creator.coverImage && (
            <img 
              src={creator.coverImage} 
              alt={`${creator.displayName}'s cover`} 
              className="w-full h-full object-cover" 
            />
          )}
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-6 w-32 h-32 rounded-full overflow-hidden border-4 border-[#2C2C2E]">
            {creator.profilePicture ? (
              <img 
                src={creator.profilePicture} 
                alt={creator.displayName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#3A3A3C] text-white text-4xl font-bold">
                {creator.displayName.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button variant="ghost" className="bg-[#1E1E1E]/30 hover:bg-[#1E1E1E]/50 backdrop-blur-sm text-white rounded-full aspect-square p-2">
              <ShareIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="bg-[#1E1E1E]/30 hover:bg-[#1E1E1E]/50 backdrop-blur-sm text-white rounded-full aspect-square p-2">
              <StarIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="mt-16 px-6 pb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">
              {creator.displayName}
              {creator.isVerified && (
                <CheckIcon className="inline-block text-primary text-sm ml-1" />
              )}
            </h2>
            <div className="ml-auto">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-medium"
                onClick={() => subscribeMutation.mutate()}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  <span className="flex items-center">
                    <LoadingIcon className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                  </span>
                ) : (
                  `Subscribe • ${creator.subscriptionPrice ? formatPrice(creator.subscriptionPrice) : "$0.00"}/month`
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-[#AFAFAF] mt-1">
            @{creator.username} • {creatorContent?.length || 0} Posts • {creator.subscriptionPrice ? "Premium" : "Free"}
          </p>
          
          <p className="mt-4 text-sm">
            {creator.bio || "No bio provided."}
          </p>
          
          {/* Stats */}
          <div className="flex mt-6 text-center">
            <div className="flex-1 border-r border-[#3A3A3C]/20">
              <p className="text-2xl font-bold">{creatorContent?.length || 0}</p>
              <p className="text-xs text-[#AFAFAF]">Posts</p>
            </div>
            <div className="flex-1 border-r border-[#3A3A3C]/20">
              <p className="text-2xl font-bold">2.4K</p>
              <p className="text-xs text-[#AFAFAF]">Fans</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{creatorContent?.filter(c => 
                c.mediaUrl.endsWith('.jpg') || c.mediaUrl.endsWith('.png')
              ).length || 0}</p>
              <p className="text-xs text-[#AFAFAF]">Photos</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs and Grid */}
      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full bg-[#1E1E1E] p-0 h-auto">
          <TabsTrigger 
            value="posts"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="photos"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Photos
          </TabsTrigger>
          <TabsTrigger 
            value="videos"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger 
            value="about"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            About
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-0">
          {isContentLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-[#2C2C2E] rounded-xl overflow-hidden mb-6 animate-pulse">
                  <div className="p-4 flex items-center">
                    <Skeleton className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-64 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContent && filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredContent.map(content => (
                <PostCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
              <p className="text-[#AFAFAF]">This creator hasn't shared any posts yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="photos" className="mt-0">
          {isContentLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))}
            </div>
          ) : filteredContent && filteredContent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredContent.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No Photos Yet</h3>
              <p className="text-[#AFAFAF]">This creator hasn't shared any photos yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos" className="mt-0">
          {isContentLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          ) : filteredContent && filteredContent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredContent.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No Videos Yet</h3>
              <p className="text-[#AFAFAF]">This creator hasn't shared any videos yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="about" className="mt-0">
          <div className="bg-[#2C2C2E] rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">About {creator.displayName}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-[#AFAFAF] mb-1 text-sm">Bio</h4>
                <p>{creator.bio || "No bio provided."}</p>
              </div>
              
              <div>
                <h4 className="text-[#AFAFAF] mb-1 text-sm">Joined</h4>
                <p>{creator.createdAt ? new Date(creator.createdAt).toLocaleDateString() : "Unknown"}</p>
              </div>
              
              <div>
                <h4 className="text-[#AFAFAF] mb-1 text-sm">Subscription</h4>
                <p>{creator.subscriptionPrice ? formatPrice(creator.subscriptionPrice) + "/month" : "Free"}</p>
              </div>
              
              <div>
                <h4 className="text-[#AFAFAF] mb-1 text-sm">Contact</h4>
                <p>{creator.email || "Not available"}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#3A3A3C]/20">
              <Button className="w-full bg-primary">Subscribe</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      {...props}
    >
      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm5.293 7.707l-6.293 6.293-3.293-3.293a.999.999 0 1 0-1.414 1.414l4 4a.997.997 0 0 0 1.414 0l7-7a.999.999 0 1 0-1.414-1.414z" />
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
