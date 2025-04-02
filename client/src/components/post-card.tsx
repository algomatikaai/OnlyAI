import { useState } from "react";
import { Content, User, Comment } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import PremiumOverlay from "@/components/premium-overlay";
import AvatarVerified from "@/components/ui/avatar-verified";

interface PostCardProps {
  content: Content;
}

export default function PostCard({ content }: PostCardProps) {
  const [showAllComments, setShowAllComments] = useState(false);
  
  // Fetch the creator
  const { data: creator } = useQuery<User>({
    queryKey: [`/api/users/${content.userId}`],
  });
  
  // Fetch comments for this content
  const { data: comments } = useQuery<Comment[]>({
    queryKey: [`/api/comments/content/${content.id}`],
  });
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/content/${content.id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/content/user/${content.userId}`],
      });
    },
  });

  if (!creator) {
    return (
      <div className="bg-[#2C2C2E] rounded-xl overflow-hidden animate-pulse mb-6">
        <div className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#3A3A3C] mr-3"></div>
            <div className="flex-1">
              <div className="h-4 w-40 bg-[#3A3A3C] rounded"></div>
              <div className="h-3 w-24 bg-[#3A3A3C] rounded mt-1"></div>
            </div>
          </div>
        </div>
        <div className="h-72 bg-[#3A3A3C]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#2C2C2E] rounded-xl overflow-hidden mb-6">
      {/* Post Header */}
      <div className="p-4 flex items-center">
        <Avatar className="w-10 h-10 rounded-full overflow-hidden mr-3">
          {creator.profilePicture ? (
            <img 
              src={creator.profilePicture} 
              alt={creator.displayName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#3A3A3C] text-white">
              {creator.displayName.charAt(0)}
            </div>
          )}
        </Avatar>
        <div>
          <AvatarVerified 
            name={creator.displayName} 
            isVerified={creator.isVerified} 
          />
          <p className="text-xs text-[#AFAFAF]">
            Posted {content.createdAt ? timeAgo(new Date(content.createdAt)) : "recently"}
          </p>
        </div>
        <div className="ml-auto">
          {content.isPremium && (
            <span className="bg-[#FFD700]/20 text-[#FFD700] text-xs px-2 py-0.5 rounded-full font-medium mr-2">
              <CrownIcon className="inline-block mr-1 h-3 w-3" /> Premium
            </span>
          )}
          <Button variant="ghost" size="icon" className="text-[#AFAFAF]">
            <MoreIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="relative">
        {content.isPremium ? (
          <>
            <img
              src={content.mediaUrl}
              alt={content.title || "Premium content"}
              className="w-full blur-md"
            />
            <PremiumOverlay 
              creatorName={creator.displayName}
              price={creator.subscriptionPrice}
            />
          </>
        ) : (
          <img
            src={content.mediaUrl}
            alt={content.title || "Content"}
            className="w-full"
          />
        )}
      </div>
      
      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center pb-3 border-b border-[#3A3A3C]/20">
          <Button
            variant="ghost"
            size="sm"
            className={`mr-4 flex items-center ${
              content.isPremium ? "text-[#AFAFAF]" : "text-primary"
            }`}
            onClick={() => !content.isPremium && likeMutation.mutate()}
            disabled={likeMutation.isPending || content.isPremium}
          >
            <HeartIcon className="mr-2 h-4 w-4" />
            <span className="text-sm">{content.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-[#AFAFAF] mr-4 flex items-center">
            <CommentIcon className="mr-2 h-4 w-4" />
            <span className="text-sm">{content.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-[#AFAFAF] flex items-center">
            <BookmarkIcon className="h-4 w-4" />
          </Button>
          {!content.isPremium && (
            <Button className="ml-auto bg-[#3A3A3C] hover:bg-[#3A3A3C]/80 text-white px-4 py-1.5 rounded-full text-sm font-medium">
              <DollarIcon className="mr-1 h-4 w-4" /> Tip
            </Button>
          )}
        </div>
        
        {/* Caption */}
        {content.description && (
          <p className="text-sm mt-3">
            {content.isPremium 
              ? "Subscribe to see this exclusive content... 😏"
              : content.description
            }
          </p>
        )}
        
        {/* Comments Preview */}
        {!content.isPremium && comments && comments.length > 0 && (
          <div className="mt-3">
            <p className="text-[#AFAFAF] text-xs font-medium mt-2">
              {showAllComments 
                ? "All comments" 
                : `View all ${content.comments} comments`}
            </p>
            
            {/* Show only first comment if not expanded */}
            {(showAllComments ? comments : comments.slice(0, 1)).map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            
            {comments.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#AFAFAF] text-xs mt-1 h-6 px-0"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? "Show less" : "Show more comments"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  // Get user who made the comment
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${comment.userId}`],
  });
  
  if (!user) return null;
  
  return (
    <div className="flex items-start mt-2">
      <Avatar className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.displayName} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#3A3A3C] text-white text-xs">
            {user.displayName.charAt(0)}
          </div>
        )}
      </Avatar>
      <div>
        <p className="text-xs">
          <span className="font-medium">{user.displayName}</span> {comment.text}
        </p>
        <p className="text-[#AFAFAF] text-xs mt-1">
          {comment.createdAt && timeAgo(new Date(comment.createdAt))} • Like • Reply
        </p>
      </div>
    </div>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}

function CommentIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function BookmarkIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function DollarIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}

function MoreIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  );
}

function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
    </svg>
  );
}
