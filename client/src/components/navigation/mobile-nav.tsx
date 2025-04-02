import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onCreateClick: () => void;
}

export default function MobileNav({ onCreateClick }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-[#1E1E1E] border-t border-[#3A3A3C]/20">
      <div className="flex items-center justify-around py-3">
        <Link href="/">
          <a className={cn("text-xl", location === "/" ? "text-primary" : "text-[#AFAFAF]")}>
            <HomeIcon />
          </a>
        </Link>
        <Link href="/discover">
          <a
            className={cn(
              "text-xl",
              location === "/discover" ? "text-primary" : "text-[#AFAFAF]"
            )}
          >
            <CompassIcon />
          </a>
        </Link>
        <div className="relative -mt-8">
          <button
            onClick={onCreateClick}
            className="bg-primary text-white rounded-full p-4 shadow-lg"
          >
            <PlusIcon />
          </button>
        </div>
        <Link href="/notifications">
          <a
            className={cn(
              "text-xl",
              location === "/notifications" ? "text-primary" : "text-[#AFAFAF]"
            )}
          >
            <BellIcon />
          </a>
        </Link>
        <Link href="/profile">
          <a
            className={cn(
              "text-xl",
              location === "/profile" ? "text-primary" : "text-[#AFAFAF]"
            )}
          >
            <UserIcon />
          </a>
        </Link>
      </div>
    </nav>
  );
}

function HomeIcon() {
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
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CompassIcon() {
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
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function PlusIcon() {
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
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function BellIcon() {
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
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserIcon() {
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
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
