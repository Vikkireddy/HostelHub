"use client";

import { useCallback } from "react";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { Checkbox } from "@/components/ui/checkbox";
import { t } from "@/lib/i18n";
import type { EnKeys } from "@/lib/i18n";
import {
  PERMISSION_MODULE_ORDER,
  type CrudFlags,
  type PermissionsMatrix,
} from "@/lib/permissionMatrix";
import type { PermissionMatrixEditorProps } from "./types";

const flagKeys: (keyof CrudFlags)[] = ["view", "add", "edit", "delete"];

const flagLabel = (k: keyof CrudFlags): EnKeys => {
  if (k === "view") return "USERS_ROLES_MATRIX_VIEW";
  if (k === "add") return "USERS_ROLES_MATRIX_ADD";
  if (k === "edit") return "USERS_ROLES_MATRIX_EDIT";
  return "USERS_ROLES_MATRIX_DELETE";
};

export const PermissionMatrixEditor = ({ value, onChange }: PermissionMatrixEditorProps) => {
  const setAll = useCallback(
    (checked: boolean) => {
      const next: PermissionsMatrix = { ...value };
      for (const { key } of PERMISSION_MODULE_ORDER) {
        next[key] = {
          view: checked,
          add: checked,
          edit: checked,
          delete: checked,
        };
      }
      onChange(next);
    },
    [value, onChange]
  );

  const setModuleAll = useCallback(
    (moduleKey: (typeof PERMISSION_MODULE_ORDER)[number]["key"], checked: boolean) => {
      const next: PermissionsMatrix = { ...value, [moduleKey]: { view: checked, add: checked, edit: checked, delete: checked } };
      onChange(next);
    },
    [value, onChange]
  );

  const toggleCell = useCallback(
    (moduleKey: (typeof PERMISSION_MODULE_ORDER)[number]["key"], flag: keyof CrudFlags, checked: boolean) => {
      const cur = value[moduleKey] ?? { view: false, add: false, edit: false, delete: false };
      onChange({
        ...value,
        [moduleKey]: { ...cur, [flag]: checked },
      });
    },
    [value, onChange]
  );

  const allSelected = PERMISSION_MODULE_ORDER.every(({ key }) => {
    const c = value[key];
    return c && c.view && c.add && c.edit && c.delete;
  });

  return (
    <Box className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox checked={allSelected} onChange={(e) => setAll(e.target.checked)} />
                <span>{t("USERS_ROLES_MATRIX_SELECT_ALL")}</span>
              </label>
            </th>
            {flagKeys.map((fk) => (
              <th key={fk} className="px-2 py-2 text-center font-semibold text-slate-600">
                {t(flagLabel(fk))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULE_ORDER.map(({ key, i18nKey }) => {
            const c = value[key] ?? { view: false, add: false, edit: false, delete: false };
            const rowAll = c.view && c.add && c.edit && c.delete;
            return (
              <tr key={key} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox checked={rowAll} onChange={(e) => setModuleAll(key, e.target.checked)} />
                    <Typography className="text-slate-800">{t(i18nKey as EnKeys)}</Typography>
                  </label>
                </td>
                {flagKeys.map((fk) => (
                  <td key={fk} className="px-2 py-2 text-center">
                    <Checkbox
                      checked={Boolean(c[fk])}
                      onChange={(e) => toggleCell(key, fk, e.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};
