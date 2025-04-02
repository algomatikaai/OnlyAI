import { cn } from "@/lib/utils";

interface AvatarVerifiedProps {
  name: string;
  isVerified: boolean;
  className?: string;
}

export default function AvatarVerified({ name, isVerified, className }: AvatarVerifiedProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <p className="font-medium">{name}</p>
      {isVerified && (
        <CheckCircleIcon className="text-primary text-xs ml-1" />
      )}
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
