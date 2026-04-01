"use client";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { SecuritySettingsTabProps } from "./types";

export function SecuritySettingsTab({
  currentPassword,
  newPassword,
  confirmPassword,
  passwordError,
  passwordSuccess,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: SecuritySettingsTabProps) {
  return (
    <TabsContent value="security" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockOutlinedIcon className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your login credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {passwordError && <Typography variant="error" className="text-sm">{passwordError}</Typography>}
            {passwordSuccess && (
              <Typography className="text-sm text-emerald-600">Password updated successfully</Typography>
            )}
            <Box className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                placeholder="Enter current password"
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                placeholder="Enter new password"
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="Confirm new password"
              />
            </Box>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
