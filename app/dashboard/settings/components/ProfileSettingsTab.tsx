"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { ProfileSettingsTabProps } from "./types";

export function ProfileSettingsTab({
  displayName,
  profileEmail,
  profileName,
  profileError,
  profileLoading,
  profileSaved,
  onProfileNameChange,
  onProfileEmailChange,
  onSubmit,
  allowEdit = true,
}: ProfileSettingsTabProps) {
  return (
    <TabsContent value="profile" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PersonOutlineIcon className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Manage your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <Box className="mb-6 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Box>
              <Typography className="font-semibold">{displayName}</Typography>
              <Typography variant="muted">{profileEmail}</Typography>
            </Box>
          </Box>
          <form onSubmit={onSubmit} className="space-y-4">
            {profileError && <Typography variant="error" className="text-sm">{profileError}</Typography>}
            <Box className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => onProfileNameChange(e.target.value)}
                placeholder="Your name"
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="email">Email / Phone</Label>
              <Input
                id="email"
                type="email"
                value={profileEmail}
                disabled={!allowEdit}
                onChange={(e) => onProfileEmailChange(e.target.value)}
                placeholder="admin@hostel.com"
              />
            </Box>
            <Button
              type="submit"
              disabled={!allowEdit || profileLoading}
              title={!allowEdit ? "You don't have permission to change settings" : undefined}
            >
              {profileLoading ? "Saving..." : profileSaved ? "Saved" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
