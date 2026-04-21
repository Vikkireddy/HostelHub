"use client";

import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";
import { UsersRolesActionsMenu } from "./UsersRolesActionsMenu";
import { UsersRolesOwnerHint } from "./UsersRolesOwnerHint";
import type { UsersRolesUsersTableProps } from "./types";
import { initials, roleBadgeClass } from "./usersRoles.utils";

export function UsersRolesUsersTable({
  users,
  usersLoading,
  hostelName,
  canManage,
  canAdd,
  canEdit,
  canDelete,
  currentUser,
  updateUserPending,
  deleteUserPending,
  onAddUser,
  onEditUser,
  onDeleteUser,
}: UsersRolesUsersTableProps) {
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg text-slate-900">{t("USERS_ROLES_TAB_USERS")}</CardTitle>
          <CardDescription>{t("USERS_ROLES_PAGE_SUBTITLE")}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!canManage && <UsersRolesOwnerHint />}
          <Button
            type="button"
            size="sm"
            className="gap-1"
            disabled={!canManage || !canAdd}
            title={
              !canManage ? undefined : !canAdd ? "You don't have permission to add users" : undefined
            }
            onClick={onAddUser}
          >
            <Plus className="h-4 w-4" />
            {t("USERS_ROLES_ADD_USER")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {usersLoading ? (
          <Typography variant="muted">{t("USERS_ROLES_LOADING")}</Typography>
        ) : users.length === 0 ? (
          <Typography variant="muted">{t("USERS_ROLES_EMPTY_USERS")}</Typography>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">{t("USERS_ROLES_COL_HASH")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_NAME")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_PHONE")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_EMAIL")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_ROLE")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_HOSTEL")}</TableHead>
                  <TableHead>{t("USERS_ROLES_COL_STATUS")}</TableHead>
                  <TableHead className="w-[100px] text-right">{t("USERS_ROLES_COL_ACTIONS")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u, idx) => {
                  const roleLabel = u.is_owner ? t("USERS_ROLES_ROLE_OWNER") : u.role_name || "—";
                  const isSelf =
                    (currentUser.adminId != null && u.id === currentUser.adminId) ||
                    (currentUser.adminId == null &&
                      currentUser.email &&
                      u.email.toLowerCase() === currentUser.email.toLowerCase());
                  const canDeleteThisUser = canManage && canDelete && !u.is_owner && !isSelf;
                  const canEditThisUser = canManage && canEdit && (!u.is_owner || isSelf);
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                            {initials(u.name)}
                          </span>
                          <span className="font-medium text-slate-900">{u.name}</span>
                          {u.is_owner && <Shield className="h-4 w-4 text-amber-600" aria-hidden />}
                        </div>
                      </TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{u.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(roleLabel)}`}
                        >
                          {roleLabel}
                        </span>
                      </TableCell>
                      <TableCell>{u.hostel_name || hostelName}</TableCell>
                      <TableCell>
                        <span
                          className={
                            u.is_active
                              ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                              : "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                          }
                        >
                          {u.is_active ? t("USERS_ROLES_STATUS_ACTIVE") : t("USERS_ROLES_STATUS_INACTIVE")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <UsersRolesActionsMenu
                          ariaLabel={t("USERS_ROLES_MENU_USER_ACTIONS")}
                          actions={[
                            {
                              key: "edit",
                              label: t("USERS_ROLES_EDIT_ROLE"),
                              icon: Pencil,
                              hidden: !canEditThisUser,
                              disabled: updateUserPending,
                              onClick: () =>
                                onEditUser({
                                  id: u.id,
                                  name: u.name,
                                  email: u.email,
                                  phone: u.phone,
                                  is_active: u.is_active,
                                  is_owner: u.is_owner,
                                  role_id: u.role_id,
                                  permissions_override: u.permissions_override,
                                }),
                            },
                            {
                              key: "delete",
                              label: t("USERS_ROLES_DELETE_USER"),
                              icon: Trash2,
                              destructive: true,
                              hidden: !(canManage && canDelete),
                              disabled: !canDeleteThisUser || deleteUserPending,
                              tooltip:
                                canManage && canDelete && !canDeleteThisUser
                                  ? u.is_owner
                                    ? "The owner account cannot be deleted"
                                    : isSelf
                                      ? "You cannot delete your own account"
                                      : undefined
                                  : undefined,
                              onClick: () => onDeleteUser(u),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Typography variant="muted" className="mt-3 text-sm">
              {t("USERS_ROLES_SHOWING_COUNT", { n: users.length })}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
