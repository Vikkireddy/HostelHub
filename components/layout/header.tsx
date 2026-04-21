"use client";

import { useEffect, useState } from "react";
import { Search, Bell, LogOut, Settings, Home, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useAuthStore } from "@/lib/AuthStore";
import { useSettingsStore } from "@/lib/SettingsStore";
import { useSearchStore } from "@/lib/SearchStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { useRouter } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { SUBSCRIPTION_PAGE_PATH } from "@/lib/subscription/constants";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleMobileSidebar?: () => void;
}

export function Header({ title, subtitle, onToggleMobileSidebar }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hostelId = user?.hostelId ?? null;
  const name = useSettingsStore((s) => s.name);
  const email = useSettingsStore((s) => s.email);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(query);
  const displayName = name || user?.name || "Admin";
  const displayEmail = email || user?.email || "admin@hostel.com";

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const id = setTimeout(() => setQuery(searchInput), 150);
    return () => clearTimeout(id);
  }, [searchInput, setQuery]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSettingsClick = () => {
    router.push("/dashboard/settings");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  const { status: subscriptionStatus, setStatus } = useSubscriptionStore();
  const { data: subscriptionApiData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription-status", hostelId],
    enabled: Boolean(hostelId) && !subscriptionStatus,
    queryFn: () =>
      fetchWithHostel("/api/subscription/status", hostelId).then((r) => r.json()),
  });

  useEffect(() => {
    if (!subscriptionApiData?.success) return;
    setStatus(subscriptionApiData);
  }, [subscriptionApiData, setStatus]);

  const currentSubscription = subscriptionStatus ?? (subscriptionApiData?.success ? subscriptionApiData : null);

  const trialEndsAt = currentSubscription?.trialEndsAt
    ? new Date(currentSubscription.trialEndsAt)
    : null;
  const daysLeft =
    trialEndsAt != null
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  const handleManageSubscription = () => {
    router.push(SUBSCRIPTION_PAGE_PATH);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8">
      <Box className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={onToggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Box>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <Typography variant="muted">{subtitle}</Typography>
        )}
        </Box>
      </Box>
      <Box className="flex items-center gap-4">
        <Box className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search residents, rooms, payments..."
            className="w-64 rounded-lg border-border bg-muted pl-9 focus:bg-background"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </Box>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-2">
            <DropdownMenuLabel>
              <Box className="flex flex-col space-y-1">
                <Typography className="text-sm font-medium">{displayName}</Typography>
                <Typography variant="caption">{displayEmail}</Typography>
              </Box>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleHomeClick} className="gap-2">
              <Home className="h-4 w-4" />
              Website home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick} className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <Box className="border-b border-t border-border p-4">
              <Typography variant="caption" className="text-muted-foreground">
                Plan
              </Typography>

              {subscriptionLoading || !currentSubscription ? (
                <Typography className="mt-2 text-sm text-muted-foreground">Loading...</Typography>
              ) : currentSubscription.isTrial ? (
                <>
                  <Box className="mt-2 flex items-center justify-between gap-3">
                    <Typography className="text-sm font-semibold">Trial</Typography>
                    {daysLeft != null && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {daysLeft} days left
                      </span>
                    )}
                  </Box>

                  <Typography className="mt-2 text-sm text-muted-foreground">
                    Your trial expires in {daysLeft ?? 0} days. Upgrade now to continue.
                  </Typography>

                  <Button size="sm" className="mt-3 w-full" onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </>
              ) : (
                <>
                  <Box className="mt-2 flex items-center justify-between gap-3">
                    <Typography className="text-sm font-semibold">
                      {currentSubscription.planName ?? "Plan"}
                    </Typography>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">
                      {currentSubscription.hasActiveSubscription ? "Active" : "Required"}
                    </span>
                  </Box>

                  <Typography className="mt-2 text-sm text-muted-foreground">
                    {currentSubscription.bannerType === "subscription_required" ||
                    currentSubscription.bannerType === "subscription_expired"
                      ? "Choose a plan to continue."
                      : "Subscription is active."}
                  </Typography>

                  <Button size="sm" className="mt-3 w-full" onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </>
              )}
            </Box>

            <DropdownMenuItem onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Box>
    </header>
  );
}
