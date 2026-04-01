"use client";

import { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Tabs } from "@/components/ui/tabs";
import { useSettingsStore } from "@/lib/SettingsStore";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/lib/AuthStore";
import { SettingsTabsList } from "./components/SettingsTabsList";
import { ProfileSettingsTab } from "./components/ProfileSettingsTab";
import { SecuritySettingsTab } from "./components/SecuritySettingsTab";
import { NotificationsSettingsTab } from "./components/NotificationsSettingsTab";
import { AppearanceSettingsTab } from "./components/AppearanceSettingsTab";
import { BrandingSettingsTab } from "./components/BrandingSettingsTab";

const DEFAULT_HOSTEL_LOGO_URL = "/branding/default-logo.png";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const hostelId = user?.hostelId ?? null;
  const name = useSettingsStore((s) => s.name);
  const email = useSettingsStore((s) => s.email);
  const notifications = useSettingsStore((s) => s.notifications);
  const setProfile = useSettingsStore((s) => s.setProfile);
  const setNotifications = useSettingsStore((s) => s.setNotifications);
  const setBranding = useSettingsStore((s) => s.setBranding);
  const brandingByHostelId = useSettingsStore((s) => s.brandingByHostelId);
  const branding = hostelId != null ? brandingByHostelId[hostelId] : undefined;
  const hostelName = branding?.hostelName ?? "";
  const hostelLogoUrl = branding?.hostelLogoUrl ?? null;
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
  const [brandingLogoPreview, setBrandingLogoPreview] = useState<string | null>(
    hostelLogoUrl ?? DEFAULT_HOSTEL_LOGO_URL
  );
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [brandingError, setBrandingError] = useState("");

  useEffect(() => {
    setProfileName(name || user?.name || "Administrator");
    setProfileEmail(email || user?.email || "admin@hostel.com");
  }, [name, email, user?.name, user?.email]);

  useEffect(() => {
    setBrandingHostelName(hostelName || "HostelHub");
    setBrandingLogoPreview(hostelLogoUrl ?? DEFAULT_HOSTEL_LOGO_URL);
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
      const logoToSave =
        brandingLogoPreview && brandingLogoPreview !== DEFAULT_HOSTEL_LOGO_URL
          ? brandingLogoPreview
          : null;
      setBranding(hostelId, nameToSave, logoToSave);
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 2000);
    }
  };

  const displayName = profileName || "Administrator";

  return (
    <Box className="mx-auto max-w-3xl space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <SettingsTabsList />

        <ProfileSettingsTab
          displayName={displayName}
          profileEmail={profileEmail}
          profileName={profileName}
          profileError={profileError}
          profileLoading={profileLoading}
          profileSaved={profileSaved}
          onProfileNameChange={setProfileName}
          onProfileEmailChange={setProfileEmail}
          onSubmit={handleSaveProfile}
        />

        <SecuritySettingsTab
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          passwordError={passwordError}
          passwordSuccess={passwordSuccess}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleUpdatePassword}
        />

        <NotificationsSettingsTab
          emailNotifications={notifications.emailNotifications}
          paymentReminders={notifications.paymentReminders}
          notifSaved={notifSaved}
          onEmailNotificationsChange={(checked) => setNotifications({ emailNotifications: checked })}
          onPaymentRemindersChange={(checked) => setNotifications({ paymentReminders: checked })}
          onSubmit={handleSaveNotifications}
        />

        <AppearanceSettingsTab />

        <BrandingSettingsTab
          hostelId={hostelId}
          brandingHostelName={brandingHostelName}
          brandingLogoPreview={brandingLogoPreview}
          brandingSaved={brandingSaved}
          brandingError={brandingError}
          onBrandingHostelNameChange={setBrandingHostelName}
          onLogoChange={handleLogoChange}
          onRemoveLogo={() => {
            setBrandingLogoFile(null);
            setBrandingLogoPreview(DEFAULT_HOSTEL_LOGO_URL);
          }}
          onSubmit={handleSaveBranding}
        />
      </Tabs>
    </Box>
  );
}
