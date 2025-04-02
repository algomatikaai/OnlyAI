import { Content, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar } from "@/components/ui/avatar";
import PremiumOverlay from "@/components/premium-overlay";
import AvatarVerified from "@/components/ui/avatar-verified";

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  // Fetch the user who created this content
  const { data: creator } = useQuery<User>({
    queryKey: [`/api/users/${content.userId}`],
  });

  if (!creator) {
    return (
      <div className="bg-[#2C2C2E] rounded-xl overflow-hidden animate-pulse">
        <div className="aspect-[3/4] bg-[#3A3A3C]"></div>
        <div className="p-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#3A3A3C] mr-2"></div>
            <div>
              <div className="h-4 w-24 bg-[#3A3A3C] rounded"></div>
              <div className="h-3 w-16 bg-[#3A3A3C] rounded mt-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2C2C2E] rounded-xl overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden">
        {content.isPremium ? (
          <>
            <img
              src={content.mediaUrl}
              alt={content.title || "Premium content"}
              className="w-full h-full object-cover blur-sm"
            />
            <PremiumOverlay creatorName={creator.displayName} price={creator.subscriptionPrice} />
            <div className="absolute top-3 left-3 bg-[#FFD700]/80 backdrop-blur-sm text-xs px-2 py-1 rounded-lg flex items-center text-[#121212] font-medium">
              <CrownIcon className="mr-1 h-3 w-3" /> Premium
            </div>
          </>
        ) : (
          <>
            <img
              src={content.mediaUrl}
              alt={content.title || "Content"}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#1E1E1E]/80 backdrop-blur-sm text-xs px-2 py-1 rounded-lg flex items-center">
              <ImageIcon className="mr-1 h-3 w-3" /> Free
            </div>
          </>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center">
          <Link href={`/creator/${creator.username}`}>
            <a className="flex items-center flex-1">
              <Avatar className="w-8 h-8 rounded-full overflow-hidden mr-2">
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
                  className="text-sm"
                />
                <p className="text-[#AFAFAF] text-xs">@{creator.username}</p>
              </div>
            </a>
          </Link>
          <div className="flex items-center text-[#AFAFAF]">
            <HeartIcon className="mr-1 h-3.5 w-3.5" />
            <span className="text-xs">{content.likes}</span>
          </div>
        </div>
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

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
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
