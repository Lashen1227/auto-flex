import { Link } from "@tanstack/react-router";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Zap } from "lucide-react";
import type { ReactNode } from "react";

export function Header() {
  const { isAuthenticated, username, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--navy)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--electric)] to-[#7AA8FF] shadow-lg shadow-[color:var(--electric)]/40">
            <Zap className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Auto<span className="text-[color:var(--electric)]">Flex</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/vehicles">Inventory</NavLink>
          {isAuthenticated && <NavLink to="/admin">Add vehicle</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-white/70 sm:inline">
                {username ?? "Signed in"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-[color:var(--electric)] text-white shadow-lg shadow-[color:var(--electric)]/30 hover:bg-[color:var(--electric)]/90"
              onClick={() => signIn()}
            >
              <LogIn className="mr-2 h-4 w-4" /> Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
      activeProps={{ className: "bg-white/10 text-white" }}
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}
