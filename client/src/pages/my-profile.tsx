import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { User, Content } from "@shared/schema";
import ContentCard from "@/components/content-card";
import { formatPrice } from "@/lib/utils";

export default function MyProfile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [editMode, setEditMode] = useState(false);
  
  // For a real app, this would be the authenticated user's ID
  const userId = 1;

  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: [`/api/users/by-id/${userId}`],
  });

  // Fetch user's content
  const { data: userContent, isLoading: isContentLoading } = useQuery<Content[]>({
    queryKey: [`/api/content/user/${userId}`],
  });

  // Profile update form state
  const [profileData, setProfileData] = useState<{
    displayName: string;
    bio: string;
    email: string;
    subscriptionPrice: number;
  }>({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    email: user?.email || "",
    subscriptionPrice: user?.subscriptionPrice || 0,
  });

  // Update profile fields when user data loads
  useState(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName,
        bio: user.bio || "",
        email: user.email,
        subscriptionPrice: user.subscriptionPrice || 0,
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return await apiRequest("PATCH", `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/by-id/${userId}`],
      });
      setEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({
      displayName: profileData.displayName,
      bio: profileData.bio,
      email: profileData.email,
      subscriptionPrice: profileData.subscriptionPrice,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: name === "subscriptionPrice" ? parseInt(value) * 100 : value,
    }));
  };

  if (isUserLoading) {
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
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
            <Skeleton className="h-20 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-[#AFAFAF]">Could not load your profile information.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Profile Header */}
      <div className="bg-[#2C2C2E] rounded-xl overflow-hidden mb-8">
        {/* Cover Image */}
        <div className="h-48 bg-[#3A3A3C] relative">
          {user.coverImage && (
            <img 
              src={user.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover" 
            />
          )}
          
          {/* Edit Cover Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-[#1E1E1E]/60 hover:bg-[#1E1E1E]/80 backdrop-blur-sm text-white rounded-full"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit Cover
          </Button>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-6 w-32 h-32 rounded-full overflow-hidden border-4 border-[#2C2C2E]">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.displayName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#3A3A3C] text-white text-4xl font-bold">
                {user.displayName.charAt(0)}
              </div>
            )}
            
            {/* Edit Profile Picture Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-0 right-0 bg-primary/80 hover:bg-primary text-white rounded-full w-8 h-8 p-0"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="mt-16 px-6 pb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">
              {user.displayName}
              {user.isVerified && (
                <CheckIcon className="inline-block text-primary text-sm ml-1" />
              )}
            </h2>
            <div className="ml-auto">
              <Button 
                variant={editMode ? "destructive" : "outline"}
                onClick={() => {
                  if (editMode) {
                    // Reset the form
                    setProfileData({
                      displayName: user.displayName,
                      bio: user.bio || "",
                      email: user.email,
                      subscriptionPrice: user.subscriptionPrice || 0,
                    });
                  }
                  setEditMode(!editMode);
                }}
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-[#AFAFAF] mt-1">
            @{user.username} • {userContent?.length || 0} Posts • {user.isCreator ? "Creator" : "Subscriber"}
          </p>
          
          <p className="mt-4 text-sm">
            {user.bio || "No bio provided. Edit your profile to add a bio."}
          </p>
          
          {/* Stats */}
          <div className="flex mt-6 text-center">
            <div className="flex-1 border-r border-[#3A3A3C]/20">
              <p className="text-2xl font-bold">{userContent?.length || 0}</p>
              <p className="text-xs text-[#AFAFAF]">Posts</p>
            </div>
            <div className="flex-1 border-r border-[#3A3A3C]/20">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-[#AFAFAF]">Subscribers</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-[#AFAFAF]">Subscriptions</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full bg-[#1E1E1E] p-0 h-auto">
          <TabsTrigger 
            value="content"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            My Content
          </TabsTrigger>
          <TabsTrigger 
            value="characters"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Characters
          </TabsTrigger>
          <TabsTrigger 
            value="subscriptions"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Subscriptions
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="flex-1 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-0">
          {isContentLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))}
            </div>
          ) : userContent && userContent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {userContent.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No Content Yet</h3>
              <p className="text-[#AFAFAF] mb-6">You haven't created any content yet.</p>
              <Button className="bg-primary hover:bg-primary/90">Create Content</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="characters" className="mt-0">
          <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Characters Coming Soon</h3>
            <p className="text-[#AFAFAF] mb-6">Create and manage your AI characters from this section.</p>
            <Button className="bg-primary hover:bg-primary/90">Create Character</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="mt-0">
          <div className="bg-[#2C2C2E] rounded-xl p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Active Subscriptions</h3>
            <p className="text-[#AFAFAF] mb-6">You're not subscribed to any creators yet.</p>
            <Button className="bg-primary hover:bg-primary/90">Discover Creators</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          name="displayName"
                          value={profileData.displayName}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="bg-[#1E1E1E] mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="bg-[#1E1E1E] mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="bg-[#1E1E1E] mt-1 resize-none"
                        rows={4}
                      />
                    </div>
                    
                    {user.isCreator && (
                      <div>
                        <Label htmlFor="subscriptionPrice">Subscription Price ($/month)</Label>
                        <Input
                          id="subscriptionPrice"
                          name="subscriptionPrice"
                          type="number"
                          value={(profileData.subscriptionPrice / 100) || ""}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="bg-[#1E1E1E] mt-1 w-40"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                  
                  {editMode && (
                    <div className="flex justify-end mt-6">
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={handleProfileUpdate}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 border-t border-[#3A3A3C]/20">
                  <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Creator Mode</p>
                        <p className="text-sm text-[#AFAFAF]">Enable to create and sell content</p>
                      </div>
                      <Switch
                        checked={user.isCreator}
                        disabled={true}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-[#AFAFAF]">Receive emails about activity</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-[#AFAFAF]">Enhance your account security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-[#3A3A3C]/20">
                  <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-[#AFAFAF]">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
      <path d="m15 5 4 4"></path>
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
