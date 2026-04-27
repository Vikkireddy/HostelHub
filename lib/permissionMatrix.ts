
export type CrudFlags = { view: boolean; add: boolean; edit: boolean; delete: boolean };

export type PermissionModuleKey =
  | "dashboard"
  | "residents"
  | "rooms"
  | "payments"
  | "expenses"
  | "documents"
  | "staff"
  | "users_roles"
  | "subscription"
  | "settings";

export type PermissionsMatrix = Partial<Record<PermissionModuleKey, CrudFlags>>;

export const PERMISSION_MODULE_ORDER: { key: PermissionModuleKey; i18nKey: string }[] = [
  { key: "dashboard", i18nKey: "USERS_ROLES_MOD_DASHBOARD" },
  { key: "residents", i18nKey: "USERS_ROLES_MOD_RESIDENTS" },
  { key: "rooms", i18nKey: "USERS_ROLES_MOD_ROOMS" },
  { key: "payments", i18nKey: "USERS_ROLES_MOD_PAYMENTS" },
  { key: "expenses", i18nKey: "USERS_ROLES_MOD_EXPENSES" },
  { key: "documents", i18nKey: "USERS_ROLES_MOD_DOCUMENTS" },
  { key: "staff", i18nKey: "USERS_ROLES_MOD_STAFF" },
  { key: "users_roles", i18nKey: "USERS_ROLES_MOD_USERS_ROLES" },
  { key: "subscription", i18nKey: "USERS_ROLES_MOD_SUBSCRIPTION" },
  { key: "settings", i18nKey: "USERS_ROLES_MOD_SETTINGS" },
];

/** All flags off (e.g. explicit deny in merge fallbacks). */
export const emptyCrud = (): CrudFlags => ({
  view: false,
  add: false,
  edit: false,
  delete: false,
});

export const defaultModuleCrud = (): CrudFlags => ({
  view: true,
  add: false,
  edit: false,
  delete: false,
});

export const defaultEmptyMatrix = (): PermissionsMatrix => {
  const m: PermissionsMatrix = {};
  for (const { key } of PERMISSION_MODULE_ORDER) {
    m[key] = defaultModuleCrud();
  }
  return m;
};

/** Reads a CRUD flag from stored JSON; uses `defaultWhenMissing` if the key is absent. */
const coerceStoredFlag = (
  c: Record<string, unknown>,
  flag: "view" | "add" | "edit" | "delete",
  defaultWhenMissing: boolean
): boolean => {
  if (!Object.prototype.hasOwnProperty.call(c, flag)) return defaultWhenMissing;
  return Boolean(c[flag]);
};

export const parsePermissionsMatrix = (raw: unknown): PermissionsMatrix => {
  const base = defaultEmptyMatrix();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const o = raw as Record<string, unknown>;
  for (const { key } of PERMISSION_MODULE_ORDER) {
    const v = o[key];
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    const c = v as Record<string, unknown>;
    base[key] = {
      view: coerceStoredFlag(c, "view", true),
      add: coerceStoredFlag(c, "add", false),
      edit: coerceStoredFlag(c, "edit", false),
      delete: coerceStoredFlag(c, "delete", false),
    };
  }
  return base;
};

export const countModulesWithAnyPermission = (m: PermissionsMatrix): number =>
  PERMISSION_MODULE_ORDER.filter(({ key }) => {
    const c = m[key];
    if (!c) return false;
    return c.view || c.add || c.edit || c.delete;
  }).length;

export const isFullAccessMatrix = (m: PermissionsMatrix): boolean =>
  PERMISSION_MODULE_ORDER.every(({ key }) => {
    const c = m[key];
    return c && c.view && c.add && c.edit && c.delete;
  });

const mergeCrudFlags = (role: CrudFlags, partial: Partial<CrudFlags>): CrudFlags => ({
  view: typeof partial.view === "boolean" ? partial.view : role.view,
  add: typeof partial.add === "boolean" ? partial.add : role.add,
  edit: typeof partial.edit === "boolean" ? partial.edit : role.edit,
  delete: typeof partial.delete === "boolean" ? partial.delete : role.delete,
});

export const mergeEffectivePermissionMatrix = (
  roleSource: unknown,
  overrideSource: unknown | null
): PermissionsMatrix => {
  const role = parsePermissionsMatrix(roleSource);
  if (overrideSource == null || typeof overrideSource !== "object" || Array.isArray(overrideSource)) {
    return role;
  }
  const raw = overrideSource as Record<string, unknown>;
  const out: PermissionsMatrix = { ...role };
  for (const { key } of PERMISSION_MODULE_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(raw, key)) continue;
    const v = raw[key];
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    const o = v as Record<string, unknown>;
    const r = role[key] ?? defaultModuleCrud();
    out[key] = mergeCrudFlags(r, {
      view: typeof o.view === "boolean" ? o.view : undefined,
      add: typeof o.add === "boolean" ? o.add : undefined,
      edit: typeof o.edit === "boolean" ? o.edit : undefined,
      delete: typeof o.delete === "boolean" ? o.delete : undefined,
    });
  }
  return out;
};

export const fullAccessMatrix = (): PermissionsMatrix => {
  const m: PermissionsMatrix = {};
  for (const { key } of PERMISSION_MODULE_ORDER) {
    m[key] = { view: true, add: true, edit: true, delete: true };
  }
  return m;
};

export const normalizePermissionsFromDb = (raw: unknown): PermissionsMatrix => {
  if (raw == null) return parsePermissionsMatrix({});
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return parsePermissionsMatrix(raw);
  }
  if (typeof raw === "string") {
    try {
      return parsePermissionsMatrix(JSON.parse(raw));
    } catch {
      return parsePermissionsMatrix({});
    }
  }
  return parsePermissionsMatrix({});
};
