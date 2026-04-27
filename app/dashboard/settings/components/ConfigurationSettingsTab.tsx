"use client";

import { Box } from "@/components/ui/box";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";

type ConfigurationSettingsTabProps = {
  emailNotifications: boolean;
  paymentReminders: boolean;
  paymentTrackingEnabled: boolean;
  onEmailNotificationsChange: (checked: boolean) => void;
  onPaymentRemindersChange: (checked: boolean) => void;
  onPaymentTrackingChange: (checked: boolean) => void;
  hostelSelected: boolean;
  allowEdit?: boolean;
  /** Shown when the user can open Settings but may not edit configuration (e.g. staff). */
  ownerOnlyHint?: string;
};

export function ConfigurationSettingsTab({
  emailNotifications,
  paymentReminders,
  paymentTrackingEnabled,
  onEmailNotificationsChange,
  onPaymentRemindersChange,
  onPaymentTrackingChange,
  hostelSelected,
  allowEdit = true,
  ownerOnlyHint,
}: ConfigurationSettingsTabProps) {
  const paymentToggleDisabled = !allowEdit || !hostelSelected;
  return (
    <TabsContent value="configuration" className="mt-0 space-y-4">
      {ownerOnlyHint ? (
        <Typography variant="muted" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ownerOnlyHint}
        </Typography>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{t("SETTINGS_CONFIGURATION_TITLE")}</CardTitle>
          <CardDescription>{t("SETTINGS_CONFIGURATION_SUBTITLE")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Box className="space-y-0 divide-y divide-slate-200">
            <Box className="flex items-center justify-between py-4 first:pt-0">
              <Box>
                <Typography className="font-medium">{t("SETTINGS_CONFIG_EMAIL_NOTIFICATIONS")}</Typography>
                <Typography variant="muted" className="text-sm">
                  {t("SETTINGS_CONFIG_EMAIL_NOTIFICATIONS_DESC")}
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
                <Typography className="font-medium">{t("SETTINGS_CONFIG_PAYMENT_REMINDERS")}</Typography>
                <Typography variant="muted" className="text-sm">
                  {t("SETTINGS_CONFIG_PAYMENT_REMINDERS_DESC")}
                </Typography>
              </Box>
              <Switch
                checked={paymentReminders}
                disabled={!allowEdit}
                onCheckedChange={onPaymentRemindersChange}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("SETTINGS_PAYMENT_CONFIGURATION_TITLE")}</CardTitle>
          <CardDescription>{t("SETTINGS_PAYMENT_CONFIGURATION_SUBTITLE")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Box className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("SETTINGS_CONFIG_MODULE_FEATURE")}</th>
                  <th className="px-4 py-3 font-medium">{t("SETTINGS_CONFIG_DESCRIPTION")}</th>
                  <th className="px-4 py-3 font-medium">{t("SETTINGS_CONFIG_STATUS")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("SETTINGS_CONFIG_ACTION")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-4 font-medium">{t("SETTINGS_CONFIG_PAYMENTS_ROW_TITLE")}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {t("SETTINGS_CONFIG_PAYMENTS_ROW_DESCRIPTION")}
                  </td>
                  <td className="px-4 py-4">
                    <Typography
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        paymentTrackingEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {paymentTrackingEnabled
                        ? t("SETTINGS_CONFIG_STATUS_ENABLED")
                        : t("SETTINGS_CONFIG_STATUS_DISABLED")}
                    </Typography>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Switch
                      checked={paymentTrackingEnabled}
                      disabled={paymentToggleDisabled}
                      onCheckedChange={onPaymentTrackingChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
          {!hostelSelected ? (
            <Typography variant="muted" className="mt-3 text-xs">
              {t("SETTINGS_CONFIG_SELECT_HOSTEL_FIRST")}
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
