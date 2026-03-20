"use client";

import { Search, Bell, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { name, email } = useSettingsStore();
  const { query, setQuery } = useSearchStore();
  const router = useRouter();
  const displayName = name || user?.name || "Admin";
  const displayEmail = email || user?.email || "admin@hostel.com";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-8">
      <Box>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <Typography variant="muted">{subtitle}</Typography>
        )}
      </Box>
      <Box className="flex items-center gap-4">
        <Box className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students, rooms, payments..."
            className="w-64 rounded-lg border-border bg-muted pl-9 focus:bg-background"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <Box className="flex flex-col space-y-1">
                <Typography className="text-sm font-medium">{displayName}</Typography>
                <Typography variant="caption">{displayEmail}</Typography>
              </Box>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
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
