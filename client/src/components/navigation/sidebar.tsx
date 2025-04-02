import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/discover", label: "Discover", icon: CompassIcon },
    { href: "/notifications", label: "Notifications", icon: BellIcon },
    { href: "/messages", label: "Messages", icon: MessageIcon },
    { href: "/collections", label: "Collections", icon: BookmarkIcon },
    { href: "/subscriptions", label: "Subscriptions", icon: CreditCardIcon },
  ];

  return (
    <aside className={cn("flex-col w-64 bg-[#1E1E1E] border-r border-[#3A3A3C]/20 h-full", className)}>
      <div className="p-4 flex items-center">
        <span className="text-primary font-bold text-2xl">OnlyAI</span>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#2C2C2E]/50 rounded-lg mx-2",
                  location === item.href && "bg-[#2C2C2E]/50 text-primary"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#3A3A3C]/20">
        <Link 
          href="/profile"
          className="flex items-center text-white hover:bg-[#2C2C2E]/50 rounded-lg p-2"
        >
          <Avatar className="w-10 h-10 rounded-full bg-[#2C2C2E]">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User"
              className="w-full h-full object-cover"
            />
          </Avatar>
          <div className="ml-3">
            <p className="font-medium text-sm">John Smith</p>
            <p className="text-[#AFAFAF] text-xs">@johnsmith</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
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
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
