"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { t } from "@/lib/i18n";
import type { ResidentKind } from "@/lib/residentType.constants";
import { RESIDENT_DETAIL_KEYS } from "@/lib/residentType.constants";
import { RESIDENT_SECTION_LABEL, RESIDENT_DETAIL_LABEL } from "./residentTypeUi";

const textareaClassName =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function ResidentTypeDetailInputs({
  kind,
  details,
  onDetailChange,
  idPrefix = "",
  showStudentCourseHint,
  readOnly = false,
}: {
  kind: ResidentKind;
  details: Record<string, string>;
  onDetailChange: (key: string, value: string) => void;
  idPrefix?: string;
  /** When true (student + add/edit form), show hint that course lives in main Course field */
  showStudentCourseHint?: boolean;
  readOnly?: boolean;
}) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);
  const longTextKeys = new Set(["related_info", "notes", "occupation_description", "college_location"]);

  return (
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Box className="space-y-2 sm:col-span-2">
        <Typography as="div" className="text-sm font-medium text-slate-800">
          {t(RESIDENT_SECTION_LABEL[kind])}
        </Typography>
        {showStudentCourseHint && kind === "student" && (
          <Typography variant="caption" className="text-muted-foreground">
            {t("RESIDENT_RT_STUDENT_COURSE_HINT")}
          </Typography>
        )}
      </Box>

      {RESIDENT_DETAIL_KEYS[kind].map((key) => {
        const labelKey = RESIDENT_DETAIL_LABEL[key];
        const label = labelKey ? t(labelKey) : key;
        const value = details[key] ?? "";
        if (longTextKeys.has(key)) {
          return (
            <Box key={key} className="space-y-2 sm:col-span-2">
              <Label htmlFor={id(`rt-${key}`)}>{label}</Label>
              <textarea
                id={id(`rt-${key}`)}
                rows={key === "notes" || key === "related_info" ? 4 : 3}
                value={value}
                disabled={readOnly}
                onChange={(e) => onDetailChange(key, e.target.value)}
                className={textareaClassName}
              />
            </Box>
          );
        }
        return (
          <Box key={key} className="space-y-2 pl-3 ">
            <Label htmlFor={id(`rt-${key}`)}>{label}</Label>
            <Input
              id={id(`rt-${key}`)}
              value={value}
              disabled={readOnly}
              onChange={(e) => onDetailChange(key, e.target.value)}
            />
          </Box>
        );
      })}
    </Box>
  );
}
