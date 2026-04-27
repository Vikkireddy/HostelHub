"use client";

import { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import type { UsersRolesActionsMenuProps } from "./types";

export function UsersRolesActionsMenu({ ariaLabel, actions }: UsersRolesActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const visible = actions.filter((a) => !a.hidden);
  if (visible.length === 0) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        aria-label={ariaLabel}
        sx={{ color: "rgb(100 116 139)" }}
      >
        <MoreHorizontal className="h-5 w-5" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {visible.map((a) => {
          const Icon = a.icon;
          return (
            <MenuItem
              key={a.key}
              disabled={a.disabled}
              title={a.tooltip}
              onClick={() => {
                if (a.disabled) return;
                setAnchorEl(null);
                queueMicrotask(() => {
                  a.onClick();
                });
              }}
              sx={{
                gap: 1,
                ...(a.destructive ? { color: "rgb(185 28 28)" } : {}),
              }}
            >
              {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
              {a.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
