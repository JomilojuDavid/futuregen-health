import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Activity, BookOpen, Share2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/predictor", label: "Predictor", icon: Activity },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/share", label: "Share", icon: Share2 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-2 py-2">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
