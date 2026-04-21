import type { LucideIcon } from "lucide-react";
import type { PermissionsMatrix } from "@/lib/permissionMatrix";

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_owner: boolean;
  role_id: number | null;
  role_name: string;
  hostel_name: string;
  permissions_override?: unknown;
};

export type AdminRoleRow = {
  id: number;
  name: string;
  description: string;
  permissions: PermissionsMatrix;
  user_count: number;
  created_at: string;
};

export const EMPTY_ADMIN_USERS: AdminUserRow[] = [];
export const EMPTY_ADMIN_ROLES: AdminRoleRow[] = [];

export type RoleOption = { id: number; name: string; permissions: PermissionsMatrix };

export type EditUserSnapshot = {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_owner: boolean;
  role_id: number | null;
  permissions_override?: unknown;
};

export type AddUserDrawerSavePayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  isActive: boolean;
  permissionsOverride: PermissionsMatrix | null;
};

export type AddUserDrawerUpdatePayload = {
  id: number;
  name: string;
  phone: string;
  roleId: number;
  isActive: boolean;
  permissionsOverride: PermissionsMatrix | null;
  password?: string;
  confirmPassword?: string;
  isOwnerTarget: boolean;
};

export type AddUserDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostelName: string;
  roles: RoleOption[];
  editUser: EditUserSnapshot | null;
  onSave: (payload: AddUserDrawerSavePayload) => Promise<void>;
  onUpdateUser: (payload: AddUserDrawerUpdatePayload) => Promise<void>;
  saving: boolean;
};

export type RoleEditSnapshot = {
  id: number;
  name: string;
  description: string;
  permissions: PermissionsMatrix;
};

export type AddRoleDrawerSavePayload = {
  name: string;
  description: string;
  permissions: PermissionsMatrix;
};

export type AddRoleDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, drawer edits this role; when null, creates a new role. */
  editSnapshot: RoleEditSnapshot | null;
  onSave: (payload: AddRoleDrawerSavePayload) => Promise<void>;
  saving: boolean;
};

export type PermissionMatrixEditorProps = {
  value: PermissionsMatrix;
  onChange: (next: PermissionsMatrix) => void;
};

export type DeleteRoleTarget = {
  id: number;
  name: string;
};

export type DeleteRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: DeleteRoleTarget | null;
  onConfirm: () => void;
  isPending: boolean;
};

export type DeleteUserTarget = {
  id: number;
  name: string;
  email: string;
};

export type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DeleteUserTarget | null;
  onConfirm: () => void;
  isPending: boolean;
};

export type UsersRolesMenuAction = {
  key: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  hidden?: boolean;
  /** Native tooltip when the item is shown but disabled */
  tooltip?: string;
};

export type UsersRolesActionsMenuProps = {
  /** Shown in the ⋮ control for screen readers */
  ariaLabel: string;
  actions: UsersRolesMenuAction[];
};

export type CurrentAdminContext = {
  adminId: number | null | undefined;
  email: string | null | undefined;
};

export type UsersRolesUsersTableProps = {
  users: AdminUserRow[];
  usersLoading: boolean;
  hostelName: string;
  canManage: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  currentUser: CurrentAdminContext;
  updateUserPending: boolean;
  deleteUserPending: boolean;
  onAddUser: () => void;
  onEditUser: (snapshot: EditUserSnapshot) => void;
  onDeleteUser: (row: AdminUserRow) => void;
};

export type UsersRolesRolesTableProps = {
  roles: AdminRoleRow[];
  rolesLoading: boolean;
  canManage: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createRolePending: boolean;
  updateRolePending: boolean;
  deleteRolePending: boolean;
  onAddRole: () => void;
  onEditRole: (snapshot: RoleEditSnapshot) => void;
  onDeleteRole: (row: AdminRoleRow) => void;
};

export type CreateAdminRolePayload = AddRoleDrawerSavePayload;

export type UpdateAdminRolePayload = {
  id: number;
  name: string;
  description: string;
  permissions: PermissionsMatrix;
};

export type CreateAdminUserPayload = AddUserDrawerSavePayload;

export type UpdateAdminUserPayload = AddUserDrawerUpdatePayload;
