import { Outlet, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { getCurrentUser } from "@/lib/api";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function AppLayout() {
  const user = getCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const initials = user.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-soft">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden md:block">
                <h1 className="text-sm font-medium text-muted-foreground">Welcome back,</h1>
                <p className="-mt-0.5 text-sm font-semibold text-foreground">{user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-9 w-9 border-2 border-primary-soft">
                <AvatarFallback className="bg-gradient-hero text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
