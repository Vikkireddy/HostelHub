"use client";

import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { t } from "@/lib/i18n";
import type { StudentFormValues, StudentFormUpdater } from "./students.types";
import { RESIDENT_KINDS, emptyDetailsForKind, normalizeResidentKind } from "@/lib/residentType.constants";
import { RESIDENT_KIND_LABEL } from "./residentTypeUi";

/** Resident type picker only — type-specific fields are edited in View details (drawer). */
export function ResidentTypeFormSection({
  form,
  onChange,
  idPrefix = "",
}: {
  form: StudentFormValues;
  onChange: (updater: StudentFormUpdater) => void;
  idPrefix?: string;
}) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);
  const kind = normalizeResidentKind(form.resident_type);

  return (
    <Box className="space-y-4 border-t border-slate-200 pt-4 sm:col-span-2">
      <Typography as="div" className="text-sm font-semibold text-slate-900">
        {t("RESIDENT_TYPE_LABEL")}
      </Typography>
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Box className="space-y-2 sm:col-span-2">
          <Label htmlFor={id("resident_type")}>{t("RESIDENT_TYPE_LABEL")}</Label>
          <Dropdown
            id={id("resident_type")}
            value={kind}
            onValueChange={(v) => {
              const next = normalizeResidentKind(v);
              onChange((f) => ({
                ...f,
                resident_type: next,
                resident_type_details: emptyDetailsForKind(next),
              }));
            }}
            options={RESIDENT_KINDS.map((k) => ({
              value: k,
              label: t(RESIDENT_KIND_LABEL[k]),
            }))}
            placeholder={t("RESIDENT_TYPE_LABEL")}
          />
        </Box>

        <Typography variant="caption" className="text-muted-foreground sm:col-span-2">
          {t("RESIDENT_TYPE_MODAL_HINT")}
        </Typography>
      </Box>
    </Box>
  );
}
