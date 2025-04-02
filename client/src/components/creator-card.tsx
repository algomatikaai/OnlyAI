import { User } from "@shared/schema";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "wouter";
import AvatarVerified from "@/components/ui/avatar-verified";

interface CreatorCardProps {
  creator: User;
  isOnline?: boolean;
  isSelected?: boolean;
}

export default function CreatorCard({ creator, isOnline = false, isSelected = false }: CreatorCardProps) {
  return (
    <Link href={`/creator/${creator.username}`}>
      <a className="flex-shrink-0 w-28">
        <div className="relative">
          <div 
            className={`w-28 h-28 rounded-full overflow-hidden p-1 bg-[#1E1E1E] ${
              isSelected 
                ? "border-2 border-primary" 
                : "border-2 border-primary/30"
            }`}
          >
            <Avatar className="w-full h-full rounded-full">
              {creator.profilePicture ? (
                <img 
                  src={creator.profilePicture}
                  alt={creator.displayName} 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#2C2C2E] text-white text-xl font-bold">
                  {creator.displayName.charAt(0)}
                </div>
              )}
            </Avatar>
          </div>
          {isOnline && (
            <div className="absolute bottom-1 right-1 bg-[#00C896] w-4 h-4 rounded-full border-2 border-[#121212]"></div>
          )}
        </div>
        <div className="mt-2 text-center">
          <AvatarVerified name={creator.displayName} isVerified={creator.isVerified} className="justify-center text-sm" />
          <p className="text-[#AFAFAF] text-xs">@{creator.username}</p>
        </div>
      </a>
    </Link>
  );
}
