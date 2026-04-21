"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/AuthStore";
import { useSettingsStore } from "@/lib/SettingsStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { t } from "@/lib/i18n";
import { normalizePermissionsFromDb } from "@/lib/permissionMatrix";
import { hasDashboardPermission } from "@/lib/dashboardPermissionClient";
import { AddRoleDrawer } from "./AddRoleDrawer";
import { AddUserDrawer } from "./AddUserDrawer";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { DeleteRoleDialog } from "./DeleteRoleDialog";
import { UsersRolesRolesTable } from "./UsersRolesRolesTable";
import { UsersRolesUsersTable } from "./UsersRolesUsersTable";
import { toast } from "sonner";
import {
  EMPTY_ADMIN_ROLES,
  EMPTY_ADMIN_USERS,
  type AdminRoleRow,
  type AdminUserRow,
  type CreateAdminRolePayload,
  type CreateAdminUserPayload,
  type EditUserSnapshot,
  type RoleEditSnapshot,
  type RoleOption,
  type UpdateAdminRolePayload,
  type UpdateAdminUserPayload,
} from "./types";

export default function UsersAndRolesPage() {
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const canUsersRolesAdd = hasDashboardPermission(user, "users_roles", "add");
  const canUsersRolesEdit = hasDashboardPermission(user, "users_roles", "edit");
  const canUsersRolesDelete = hasDashboardPermission(user, "users_roles", "delete");
  const canManage = useMemo(() => {
    const u = user;
    if (!u?.hostelId) return false;
    if (u.canManageUsersAndRoles === true) return true;
    if (u.canManageUsersAndRoles === false) return false;
    return Boolean(u.isOwner);
  }, [user]);
  const queryClient = useQueryClient();
  const branding = useSettingsStore((s) => s.getBranding(hostelId));
  const hostelName = branding.hostelName?.trim() || t("PLATFORM_HOSTEL");

  const [userDrawer, setUserDrawer] = useState(false);
  const [editUserForDrawer, setEditUserForDrawer] = useState<EditUserSnapshot | null>(null);
  const [roleDrawer, setRoleDrawer] = useState(false);
  const [roleEditSnapshot, setRoleEditSnapshot] = useState<RoleEditSnapshot | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<AdminUserRow | null>(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<AdminRoleRow | null>(null);

  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ["dashboard-admins", hostelId],
    queryFn: async () => {
      const res = await fetchWithHostel("/api/admins", hostelId);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to load users");
      }
      return res.json() as Promise<{ users: AdminUserRow[] }>;
    },
    enabled: Boolean(hostelId),
  });

  const { data: rolesRes, isLoading: rolesLoading } = useQuery({
    queryKey: ["dashboard-admin-roles", hostelId],
    queryFn: async () => {
      const res = await fetchWithHostel("/api/admin-roles", hostelId);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to load roles");
      }
      return res.json() as Promise<{ roles: AdminRoleRow[] }>;
    },
    enabled: Boolean(hostelId),
  });

  const users = usersRes?.users ?? EMPTY_ADMIN_USERS;
  const roles = rolesRes?.roles ?? EMPTY_ADMIN_ROLES;

  const roleOptions: RoleOption[] = useMemo(
    () =>
      roles.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: normalizePermissionsFromDb(r.permissions),
      })),
    [roles]
  );

  const createRole = useMutation({
    mutationFn: async (payload: CreateAdminRolePayload) => {
      const res = await fetchWithHostel("/api/admin-roles", hostelId, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to create role");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-admin-roles"] });
      setRoleDrawer(false);
      setRoleEditSnapshot(null);
      toast.success(t("USERS_ROLES_TOAST_ROLE_SAVED"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRole = useMutation({
    mutationFn: async (payload: UpdateAdminRolePayload) => {
      const res = await fetchWithHostel(`/api/admin-roles/${payload.id}`, hostelId, {
        method: "PATCH",
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          permissions: payload.permissions,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to update role");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-admin-roles"] });
      setRoleDrawer(false);
      setRoleEditSnapshot(null);
      toast.success(t("USERS_ROLES_TOAST_ROLE_UPDATED"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateUser = useMutation({
    mutationFn: async (payload: UpdateAdminUserPayload) => {
      const body: Record<string, unknown> = {
        name: payload.name,
        phone: payload.phone,
        isActive: payload.isActive,
      };
      if (!payload.isOwnerTarget) {
        body.roleId = payload.roleId;
        body.permissionsOverride = payload.permissionsOverride;
      }
      if (payload.password) {
        body.password = payload.password;
        body.confirmPassword = payload.confirmPassword ?? "";
      }
      const res = await fetchWithHostel(`/api/admins/${payload.id}`, hostelId, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to update user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-admins"] });
      setUserDrawer(false);
      setEditUserForDrawer(null);
      toast.success(t("USERS_ROLES_TOAST_USER_UPDATED"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createUser = useMutation({
    mutationFn: async (payload: CreateAdminUserPayload) => {
      const res = await fetchWithHostel("/api/admins", hostelId, {
        method: "POST",
        body: JSON.stringify({
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          password: payload.password,
          confirmPassword: payload.confirmPassword,
          roleId: payload.roleId,
          isActive: payload.isActive,
          permissionsOverride: payload.permissionsOverride,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to create user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-admins"] });
      setUserDrawer(false);
      setEditUserForDrawer(null);
      toast.success(t("USERS_ROLES_TOAST_USER_SAVED"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: number) => {
      if (hostelId == null) throw new Error("Hostel context required");
      const res = await fetchWithHostel(`/api/admin-roles/${roleId}`, hostelId, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((j as { error?: string }).error || "Failed to delete role");
      }
    },
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-admin-roles"] });
      setDeleteRoleTarget(null);
      setRoleEditSnapshot((snap) => {
        if (snap?.id === roleId) {
          queueMicrotask(() => setRoleDrawer(false));
          return null;
        }
        return snap;
      });
      toast.success(t("USERS_ROLES_TOAST_ROLE_DELETED"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      if (hostelId == null) throw new Error("Hostel context required");
      const res = await fetchWithHostel(`/api/admins/${userId}`, hostelId, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((j as { error?: string }).error || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-admins"] });
      setDeleteUserTarget(null);
      toast.success(t("USERS_ROLES_TOAST_USER_DELETED"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!hostelId) {
    return (
      <Box className="flex items-center justify-center p-16">
        <Typography variant="muted">{t("USERS_ROLES_LOADING")}</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">{t("USERS_ROLES_TAB_USERS")}</TabsTrigger>
          <TabsTrigger value="roles">{t("USERS_ROLES_TAB_ROLES")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6 space-y-4">
          <UsersRolesUsersTable
            users={users}
            usersLoading={usersLoading}
            hostelName={hostelName}
            canManage={canManage}
            canAdd={canUsersRolesAdd}
            canEdit={canUsersRolesEdit}
            canDelete={canUsersRolesDelete}
            currentUser={{ adminId: user?.adminId, email: user?.email }}
            updateUserPending={updateUser.isPending}
            deleteUserPending={deleteUser.isPending}
            onAddUser={() => {
              setEditUserForDrawer(null);
              setUserDrawer(true);
            }}
            onEditUser={(snapshot) => {
              setEditUserForDrawer(snapshot);
              setUserDrawer(true);
            }}
            onDeleteUser={setDeleteUserTarget}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-6 space-y-4">
          <UsersRolesRolesTable
            roles={roles}
            rolesLoading={rolesLoading}
            canManage={canManage}
            canAdd={canUsersRolesAdd}
            canEdit={canUsersRolesEdit}
            canDelete={canUsersRolesDelete}
            createRolePending={createRole.isPending}
            updateRolePending={updateRole.isPending}
            deleteRolePending={deleteRole.isPending}
            onAddRole={() => {
              setRoleEditSnapshot(null);
              setRoleDrawer(true);
            }}
            onEditRole={(snapshot) => {
              setRoleEditSnapshot(snapshot);
              setRoleDrawer(true);
            }}
            onDeleteRole={setDeleteRoleTarget}
          />
        </TabsContent>
      </Tabs>

      <AddUserDrawer
        open={userDrawer}
        onOpenChange={(open) => {
          setUserDrawer(open);
          if (!open) setEditUserForDrawer(null);
        }}
        hostelName={hostelName}
        roles={roleOptions}
        editUser={editUserForDrawer}
        saving={createUser.isPending || updateUser.isPending}
        onSave={async (payload) => {
          if (!roleOptions.length) {
            toast.error(t("USERS_ROLES_NO_ROLES_YET"));
            throw new Error(t("USERS_ROLES_NO_ROLES_YET"));
          }
          await createUser.mutateAsync(payload);
        }}
        onUpdateUser={async (payload) => {
          await updateUser.mutateAsync(payload);
        }}
      />

      <AddRoleDrawer
        open={roleDrawer}
        onOpenChange={(o) => {
          setRoleDrawer(o);
          if (!o) setRoleEditSnapshot(null);
        }}
        editSnapshot={roleEditSnapshot}
        saving={createRole.isPending || updateRole.isPending}
        onSave={async (payload) => {
          if (roleEditSnapshot) {
            await updateRole.mutateAsync({
              id: roleEditSnapshot.id,
              name: payload.name,
              description: payload.description,
              permissions: payload.permissions,
            });
          } else {
            await createRole.mutateAsync(payload);
          }
        }}
      />

      <DeleteUserDialog
        open={deleteUserTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteUserTarget(null);
        }}
        user={
          deleteUserTarget
            ? { id: deleteUserTarget.id, name: deleteUserTarget.name, email: deleteUserTarget.email }
            : null
        }
        onConfirm={() => {
          if (deleteUserTarget) deleteUser.mutate(deleteUserTarget.id);
        }}
        isPending={deleteUser.isPending}
      />

      <DeleteRoleDialog
        open={deleteRoleTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteRoleTarget(null);
        }}
        role={deleteRoleTarget ? { id: deleteRoleTarget.id, name: deleteRoleTarget.name } : null}
        onConfirm={() => {
          if (deleteRoleTarget) deleteRole.mutate(deleteRoleTarget.id);
        }}
        isPending={deleteRole.isPending}
      />
    </Box>
  );
}
