import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface PremiumOverlayProps {
  creatorName: string;
  price?: number;
}

export default function PremiumOverlay({ creatorName, price }: PremiumOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212]/60 backdrop-blur-sm">
      <LockIcon className="text-primary text-4xl mb-2" />
      <p className="text-white font-medium text-center mb-2 max-w-xs">
        {price 
          ? `Subscribe to ${creatorName} to view this premium content`
          : "Premium Content"}
      </p>
      <Button className="mt-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-medium">
        Subscribe {price ? `• ${formatPrice(price)}/month` : ""}
      </Button>
    </div>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
