"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/lib/settings-store";
import { useAuthStore } from "@/lib/auth-store";
import { User, Lock, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { name, email, notifications, setProfile, setNotifications } = useSettingsStore();
  const [profileName, setProfileName] = useState(name || user?.name || "Administrator");
  const [profileEmail, setProfileEmail] = useState(email || user?.email || "admin@hostel.com");
  const [profileSaved, setProfileSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Security form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    setProfileName(name || user?.name || "Administrator");
    setProfileEmail(email || user?.email || "admin@hostel.com");
  }, [name, email, user?.name, user?.email]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profileName, profileEmail);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    // Demo: hardcoded check (replace with API when available)
    if (currentPassword !== "admin123") {
      setPasswordError("Current password is incorrect");
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 2000);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const displayName = profileName || "Administrator";

  return (
    <Box className="mx-auto max-w-3xl space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 w-full justify-start gap-1 overflow-x-auto border-b border-slate-200 bg-transparent p-0 h-auto">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
          >
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
          >
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <Box className="mb-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Box>
                  <Typography className="font-semibold">{displayName}</Typography>
                  <Typography variant="muted">{profileEmail}</Typography>
                </Box>
              </Box>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Box className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                </Box>
                <Box className="space-y-2">
                  <Label htmlFor="email">Email / Phone</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="admin@hostel.com"
                  />
                </Box>
                <Button type="submit">{profileSaved ? "Saved" : "Save Changes"}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your login credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {passwordError && (
                  <Typography variant="error" className="text-sm">{passwordError}</Typography>
                )}
                {passwordSuccess && (
                  <Typography className="text-sm text-emerald-600">Password updated successfully</Typography>
                )}
                <Box className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </Box>
                <Box className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </Box>
                <Box className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </Box>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications}>
                <Box className="space-y-0 divide-y divide-slate-200">
                  <Box className="flex items-center justify-between py-4 first:pt-0">
                    <Box>
                      <Typography className="font-medium">Email Notifications</Typography>
                      <Typography variant="muted" className="text-sm">
                        Receive updates via email
                      </Typography>
                    </Box>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ emailNotifications: checked })
                      }
                    />
                  </Box>
                  <Box className="flex items-center justify-between py-4">
                    <Box>
                      <Typography className="font-medium">Payment Reminders</Typography>
                      <Typography variant="muted" className="text-sm">
                        Get notified about upcoming payments
                      </Typography>
                    </Box>
                    <Switch
                      checked={notifications.paymentReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ paymentReminders: checked })
                      }
                    />
                  </Box>
                </Box>
                <Button type="submit" className="mt-6">
                  {notifSaved ? "Saved" : "Save Preferences"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">Appearance options coming soon.</Typography>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Box>
  );
}
