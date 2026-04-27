"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Typography } from "@/components/ui/typography";
import { CommonMuiTable, type CommonMuiTableColumn } from "@/components/ui/CommonMuiTable";
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
  const columns: CommonMuiTableColumn<(typeof roles)[number]>[] = [
    {
      key: "index",
      header: t("USERS_ROLES_COL_HASH"),
      render: (_r, rowIndex) => rowIndex + 1,
    },
    {
      key: "role_name",
      header: t("USERS_ROLES_COL_ROLE_NAME"),
      render: (r) => <span className="font-medium text-slate-900">{r.name}</span>,
    },
    {
      key: "description",
      header: t("USERS_ROLES_COL_DESCRIPTION"),
      render: (r) => r.description || "—",
    },
    {
      key: "permissions",
      header: t("USERS_ROLES_COL_PERMISSIONS"),
      render: (r) => (
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {permissionMatrixSummary(normalizePermissionsFromDb(r.permissions))}
        </span>
      ),
    },
    {
      key: "users",
      header: t("USERS_ROLES_COL_USERS"),
      render: (r) => r.user_count,
    },
    {
      key: "actions",
      header: t("USERS_ROLES_COL_ACTIONS"),
      align: "right",
      render: (r) => (
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
                r.user_count > 0 ? t("USERS_ROLES_DELETE_ROLE_BLOCKED_TOOLTIP", { n: r.user_count }) : undefined,
              onClick: () => onDeleteRole(r),
            },
          ]}
        />
      ),
    },
  ];

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
          <EmptyState
            icon={Shield}
            title={t("USERS_ROLES_EMPTY_ROLES")}
            message={t("USERS_ROLES_DRAWER_ADD_ROLE_SUBTITLE")}
            className="min-h-[250px]"
          />
        ) : (
          <>
            <CommonMuiTable
              columns={columns}
              data={roles}
              getRowId={(r) => r.id}
              tableContainerSx={{ maxHeight: "calc(100vh - 360px)" }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
