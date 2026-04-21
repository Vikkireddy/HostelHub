"use client";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import type { NotificationsSettingsTabProps } from "./types";

export function NotificationsSettingsTab({
  emailNotifications,
  paymentReminders,
  notifSaved,
  onEmailNotificationsChange,
  onPaymentRemindersChange,
  onSubmit,
  allowEdit = true,
}: NotificationsSettingsTabProps) {
  return (
    <TabsContent value="notifications" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NotificationsNoneIcon className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Box className="space-y-0 divide-y divide-slate-200">
              <Box className="flex items-center justify-between py-4 first:pt-0">
                <Box>
                  <Typography className="font-medium">Email Notifications</Typography>
                  <Typography variant="muted" className="text-sm">
                    Receive updates via email
                  </Typography>
                </Box>
                <Switch
                  checked={emailNotifications}
                  disabled={!allowEdit}
                  onCheckedChange={onEmailNotificationsChange}
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
                  checked={paymentReminders}
                  disabled={!allowEdit}
                  onCheckedChange={onPaymentRemindersChange}
                />
              </Box>
            </Box>
            <Button
              type="submit"
              className="mt-6"
              disabled={!allowEdit}
              title={!allowEdit ? "You don't have permission to change settings" : undefined}
            >
              {notifSaved ? "Saved" : t("SAVE_PREFERENCE")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
