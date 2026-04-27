"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import ApartmentIcon from "@mui/icons-material/Apartment";

export function SettingsTabsList() {
  const triggerClassName =
    "rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:shadow-none";

  return (
    <TabsList className="mb-6 w-full h-auto justify-start gap-1 overflow-x-auto border-b border-slate-200 bg-transparent p-0">
      <TabsTrigger value="profile" className={triggerClassName}>
        <PersonOutlineIcon className="mr-2 h-4 w-4" />
        Profile
      </TabsTrigger>
      <TabsTrigger value="security" className={triggerClassName}>
        <LockOutlinedIcon className="mr-2 h-4 w-4" />
        Security
      </TabsTrigger>
      <TabsTrigger value="configuration" className={triggerClassName}>
        <SettingsSuggestOutlinedIcon className="mr-2 h-4 w-4" />
        {t("SETTINGS_TAB_CONFIGURATION")}
      </TabsTrigger>
      <TabsTrigger value="branding" className={triggerClassName}>
        <ApartmentIcon className="mr-2 h-4 w-4" />
        {t("BRANDING")}
      </TabsTrigger>
    </TabsList>
  );
}
