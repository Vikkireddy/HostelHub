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
import { useSettingsStore } from "@/lib/SettingsStore";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/lib/AuthStore";
import { User, Lock, Bell, Palette, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const hostelId = user?.hostelId ?? null;
  const { name, email, notifications, setProfile, setNotifications, getBranding, setBranding } = useSettingsStore();
  const { hostelName, hostelLogoUrl } = getBranding(hostelId);
  const [profileName, setProfileName] = useState(name || user?.name || "Administrator");
  const [profileEmail, setProfileEmail] = useState(email || user?.email || "admin@hostel.com");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Security form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Branding form
  const [brandingHostelName, setBrandingHostelName] = useState(hostelName || "HostelHub");
  const [brandingLogoFile, setBrandingLogoFile] = useState<File | null>(null);
  const [brandingLogoPreview, setBrandingLogoPreview] = useState<string | null>(hostelLogoUrl);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [brandingError, setBrandingError] = useState("");

  useEffect(() => {
    setProfileName(name || user?.name || "Administrator");
    setProfileEmail(email || user?.email || "admin@hostel.com");
  }, [name, email, user?.name, user?.email]);

  useEffect(() => {
    setBrandingHostelName(hostelName || "HostelHub");
    setBrandingLogoPreview(hostelLogoUrl);
  }, [hostelName, hostelLogoUrl]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      setProfileError("You must be logged in to update your profile.");
      return;
    }
    setProfileError("");
    setProfileLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          currentEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(profileName.trim(), profileEmail.trim());
        updateUser({ name: profileName.trim() });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2000);
      } else {
        setProfileError(data.message || "Failed to update profile");
      }
    } catch {
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
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
    if (!user?.email) {
      setPasswordError("You must be logged in to change your password.");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          currentEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 2000);
      } else {
        setPasswordError(data.message || "Failed to update password");
      }
    } catch {
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setBrandingError(t("LOGO_TOO_LARGE"));
      return;
    }
    setBrandingError("");
    setBrandingLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setBrandingLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostelId == null) {
      setBrandingError(t("BRANDING_REQUIRES_HOSTEL"));
      return;
    }
    setBrandingError("");
    const nameToSave = brandingHostelName.trim() || "HostelHub";
    if (brandingLogoFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setBranding(hostelId, nameToSave, dataUrl);
        setBrandingLogoFile(null);
        setBrandingSaved(true);
        setTimeout(() => setBrandingSaved(false), 2000);
      };
      reader.readAsDataURL(brandingLogoFile);
    } else {
      setBranding(hostelId, nameToSave, brandingLogoPreview);
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 2000);
    }
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
          <TabsTrigger
            value="branding"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
          >
            <Building2 className="mr-2 h-4 w-4" />
            {t("BRANDING")}
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
                {profileError && (
                  <Typography variant="error" className="text-sm">{profileError}</Typography>
                )}
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
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? "Saving..." : profileSaved ? "Saved" : "Save Changes"}
                </Button>
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
                  {notifSaved ? "Saved" : t("SAVE_PREFERENCE")}
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
                {t("APPEARAMCE_SETTINGS")}
              </CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">Appearance options coming soon.</Typography>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("BRANDING_TITLE")}
              </CardTitle>
              <CardDescription>{t("BRANDING_DESCRIPTION")}</CardDescription>
            </CardHeader>
            <CardContent>
              {hostelId == null && (
                <Typography variant="muted" className="mb-4 text-sm">{t("BRANDING_REQUIRES_HOSTEL")}</Typography>
              )}
              <form onSubmit={handleSaveBranding} className="space-y-6">
                {brandingError && (
                  <Typography variant="error" className="text-sm">{brandingError}</Typography>
                )}
                <Box className="space-y-2">
                  <Label htmlFor="hostelName">{t("HOSTEL_NAME")}</Label>
                  <Input
                    id="hostelName"
                    value={brandingHostelName}
                    onChange={(e) => setBrandingHostelName(e.target.value)}
                    placeholder={t("HOSTEL_NAME_PLACEHOLDER")}
                  />
                </Box>
                <Box className="space-y-2">
                  <Label htmlFor="hostelLogo">{t("HOSTEL_LOGO")}</Label>
                  <Input
                    id="hostelLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  {brandingLogoPreview && (
                    <Box className="mt-3">
                      <Typography variant="muted" className="mb-2 text-sm">{t("LOGO_PREVIEW")}</Typography>
                      <Box className="flex items-center gap-3">
                        <Box className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
                          <img
                            src={brandingLogoPreview}
                            alt="Logo preview"
                            className="h-16 w-16 object-contain"
                          />
                        </Box>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setBrandingLogoFile(null);
                            setBrandingLogoPreview(null);
                          }}
                        >
                          {t("REMOVE_LOGO")}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
                <Button type="submit" disabled={hostelId == null}>
                  {brandingSaved ? t("BRANDING_SAVED") : t("SAVE_BRANDING")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Box>
  );
}
