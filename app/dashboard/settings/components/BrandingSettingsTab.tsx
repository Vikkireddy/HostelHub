"use client";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";
import ApartmentIcon from "@mui/icons-material/Apartment";
import type { BrandingSettingsTabProps } from "./types";

export function BrandingSettingsTab({
  hostelId,
  brandingHostelName,
  brandingLogoPreview,
  brandingSaved,
  brandingError,
  onBrandingHostelNameChange,
  onLogoChange,
  onRemoveLogo,
  onSubmit,
  allowEdit = true,
}: BrandingSettingsTabProps) {
  return (
    <TabsContent value="branding" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApartmentIcon className="h-5 w-5" />
            {t("BRANDING_TITLE")}
          </CardTitle>
          <CardDescription>{t("BRANDING_DESCRIPTION")}</CardDescription>
        </CardHeader>
        <CardContent>
          {hostelId == null && (
            <Typography variant="muted" className="mb-4 text-sm">{t("BRANDING_REQUIRES_HOSTEL")}</Typography>
          )}
          <form onSubmit={onSubmit} className="space-y-6">
            {brandingError && <Typography variant="error" className="text-sm">{brandingError}</Typography>}
            <Box className="space-y-2">
              <Label htmlFor="hostelName">{t("HOSTEL_NAME")}</Label>
              <Input
                id="hostelName"
                value={brandingHostelName}
                disabled={!allowEdit}
                onChange={(e) => onBrandingHostelNameChange(e.target.value)}
                placeholder={t("HOSTEL_NAME_PLACEHOLDER")}
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="hostelLogo">{t("HOSTEL_LOGO")}</Label>
              <Input
                id="hostelLogo"
                type="file"
                accept="image/*"
                disabled={!allowEdit}
                onChange={onLogoChange}
                className="cursor-pointer"
              />
              {brandingLogoPreview && (
                <Box className="mt-3">
                  <Typography variant="muted" className="mb-2 text-sm">{t("LOGO_PREVIEW")}</Typography>
                  <Box className="flex items-center gap-3">
                    <Box className="overflow-hidden rounded-lg border border-slate-200 p-2">
                      <img src={brandingLogoPreview} alt="Logo preview" className="h-16 w-16 object-contain" />
                    </Box>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!allowEdit}
                      onClick={onRemoveLogo}
                    >
                      {t("REMOVE_LOGO")}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            <Button
              type="submit"
              disabled={hostelId == null || !allowEdit}
              title={!allowEdit ? "You don't have permission to change settings" : undefined}
            >
              {brandingSaved ? t("BRANDING_SAVED") : t("SAVE_BRANDING")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
