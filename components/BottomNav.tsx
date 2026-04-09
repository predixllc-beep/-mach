"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Plus, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Feed", icon: Home },
    { href: "/market", label: "Market", icon: LineChart },
    { href: "/create", label: "Create", icon: Plus, isCenter: true },
    { href: "/pulse", label: "Pulse", icon: Activity },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center py-3 max-w-md mx-auto px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          if (link.isCenter) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-center -mt-8"
              >
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-0.5 transition-all", isActive ? "scale-110" : "")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="sr-only">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
