"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";

export function AppearanceSettingsTab() {
  return (
    <TabsContent value="appearance" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaletteOutlinedIcon className="h-5 w-5" />
            {t("APPEARAMCE_SETTINGS")}
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <Typography variant="muted">Appearance options coming soon.</Typography>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
