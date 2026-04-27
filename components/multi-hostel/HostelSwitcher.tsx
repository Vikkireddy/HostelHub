"use client";

import { useEffect, useMemo } from "react";
import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/AuthStore";
import { t } from "@/lib/i18n";

export function HostelSwitcher() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const router = useRouter();

  const mode = user?.managementMode ?? "single";
  const list = user?.accessibleHostels ?? [];
  const isOwner = Boolean(user?.isOwner);

  const listKey = useMemo(() => list.map((h) => h.id).join(","), [list]);

  useEffect(() => {
    if (!user || isOwner || list.length === 0) return;
    let nextId: number | null = null;
    if (user.hostelId == null) {
      nextId = list[0].id;
    } else if (!list.some((h) => h.id === user.hostelId)) {
      nextId = list[0].id;
    }
    if (nextId != null && user.hostelId !== nextId) {
      updateUser({ hostelId: nextId });
      router.replace("/dashboard");
    }
  }, [user, user?.hostelId, user?.adminId, isOwner, listKey, list, updateUser, router]);

  if (mode !== "multi" || list.length === 0) {
    return null;
  }

  /** Staff with one assigned property: no switcher (nothing to choose). */
  if (!isOwner && list.length === 1) {
    return null;
  }

  const showAllHostelsOption = isOwner;
  const value =
    user?.hostelId == null && showAllHostelsOption
      ? "all"
      : user?.hostelId != null && list.some((h) => h.id === user.hostelId)
        ? String(user.hostelId)
        : String(list[0]?.id ?? "");

  const onChange = (e: SelectChangeEvent<string>) => {
    const nextValue = String(e.target.value);
    if (nextValue === "all" && showAllHostelsOption) {
      updateUser({ hostelId: null });
      router.push("/dashboard");
      return;
    }
    const id = Number(nextValue);
    if (!Number.isFinite(id)) return;
    if (!isOwner && !list.some((h) => h.id === id)) return;
    updateUser({ hostelId: id });
    router.push("/dashboard");
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="hostel-switcher-label">{t("MULTI_HOSTEL_SWITCH_LABEL")}</InputLabel>
      <Select<string>
        labelId="hostel-switcher-label"
        label={t("MULTI_HOSTEL_SWITCH_LABEL")}
        value={value}
        onChange={onChange}
        sx={{ borderRadius: 1, bgcolor: "background.paper" }}
      >
        {showAllHostelsOption ? (
          <MenuItem value="all">{t("MULTI_HOSTEL_SWITCH_ALL")}</MenuItem>
        ) : null}
        {list.map((h) => (
          <MenuItem key={h.id} value={String(h.id)}>
            {h.name}
            {h.city ? ` — ${h.city}` : ""}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
