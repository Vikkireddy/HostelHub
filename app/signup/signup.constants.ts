export const INPUT_STYLE = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#f8f8f8",
    borderRadius: "4px",
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: "transparent" },
    "&.Mui-focused fieldset": { borderColor: "#18222e", borderWidth: 1 },
    "&.Mui-error fieldset": { borderColor: "#f44336" },
  },
  "& .MuiFormHelperText-root.Mui-error": { color: "#f44336" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#18222e" },
} as const;

export const INPUT_LABEL_PROPS = {
  sx: {
    "&.MuiInputLabel-shrink": { color: "#18222e" },
    "&.Mui-focused": { color: "#18222e" },
  },
} as const;

export const ICON_STYLE = { fontSize: 20, color: "#94a3b8" } as const;
export const SECTION_ICON_STYLE = { fontSize: 18, color: "#64748b" } as const;
