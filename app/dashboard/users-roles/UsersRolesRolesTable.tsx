"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";
import { normalizePermissionsFromDb } from "@/lib/permissionMatrix";
import { UsersRolesActionsMenu } from "./UsersRolesActionsMenu";
import { UsersRolesOwnerHint } from "./UsersRolesOwnerHint";
import type { UsersRolesRolesTableProps } from "./types";
import { permissionMatrixSummary } from "./usersRoles.utils";

export function UsersRolesRolesTable({
  roles,
  rolesLoading,
  canManage,
  canAdd,
  canEdit,
  canDelete,
  createRolePending,
  updateRolePending,
  deleteRolePending,
  onAddRole,
  onEditRole,
  onDeleteRole,
}: UsersRolesRolesTableProps) {
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg text-slate-900">{t("USERS_ROLES_TAB_ROLES")}</CardTitle>
          <CardDescription>{t("USERS_ROLES_DRAWER_ADD_ROLE_SUBTITLE")}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!canManage && <UsersRolesOwnerHint />}
          <Button
            type="button"
            size="sm"
            className="gap-1"
            disabled={!canManage || !canAdd}
            title={
              !canManage ? undefined : !canAdd ? "You don't have permission to add roles" : undefined
            }
            onClick={onAddRole}
          >
            <Plus className="h-4 w-4" />
            {t("USERS_ROLES_ADD_ROLE")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rolesLoading ? (
          <Typography variant="muted">{t("USERS_ROLES_LOADING")}</Typography>
        ) : roles.length === 0 ? (
          <Typography variant="muted">{t("USERS_ROLES_EMPTY_ROLES")}</Typography>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">{t("USERS_ROLES_COL_HASH")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_ROLE_NAME")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_DESCRIPTION")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_PERMISSIONS")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_USERS")}</TableHead>
                  <TableHead className="w-[100px] text-right">{t("USERS_ROLES_COL_ACTIONS")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r, idx) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-slate-900">{r.name}</TableCell>
                    <TableCell className="max-w-xs text-slate-600">{r.description || "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {permissionMatrixSummary(normalizePermissionsFromDb(r.permissions))}
                      </span>
                    </TableCell>
                    <TableCell>{r.user_count}</TableCell>
                    <TableCell className="text-right">
                      <UsersRolesActionsMenu
                        ariaLabel={t("USERS_ROLES_MENU_ROLE_ACTIONS")}
                        actions={[
                          {
                            key: "edit",
                            label: t("USERS_ROLES_EDIT_ROLE"),
                            icon: Pencil,
                            hidden: !canManage || !canEdit,
                            disabled: createRolePending || updateRolePending || deleteRolePending,
                            onClick: () =>
                              onEditRole({
                                id: r.id,
                                name: r.name,
                                description: r.description,
                                permissions: normalizePermissionsFromDb(r.permissions),
                              }),
                          },
                          {
                            key: "delete",
                            label: t("USERS_ROLES_DELETE_USER"),
                            icon: Trash2,
                            destructive: true,
                            hidden: !(canManage && canDelete),
                            disabled: r.user_count > 0 || deleteRolePending,
                            tooltip:
                              r.user_count > 0
                                ? t("USERS_ROLES_DELETE_ROLE_BLOCKED_TOOLTIP", { n: r.user_count })
                                : undefined,
                            onClick: () => onDeleteRole(r),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="muted" className="mt-3 text-sm">
              {t("USERS_ROLES_SHOWING_ROLES", { n: roles.length })}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
