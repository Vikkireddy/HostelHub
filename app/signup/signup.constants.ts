/** Solid fill for webkit autofill inset-shadow (matches dark field bg). */
const AUTOFILL_BG = "rgb(15, 23, 42)";

const webkitAutofillField = {
  WebkitBoxShadow: `0 0 0 1000px ${AUTOFILL_BG} inset`,
  WebkitTextFillColor: "#e2e8f0",
  caretColor: "#e2e8f0",
  // Delay Chrome’s autofill background repaint so our inset shadow wins
  transition: "background-color 99999s ease-out 0s",
} as const;

export const INPUT_STYLE = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#e2e8f0",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(148, 163, 184, 0.35)" },
    "&:hover fieldset": { borderColor: "rgba(148, 163, 184, 0.6)" },
    "&.Mui-focused fieldset": { borderColor: "#60a5fa", borderWidth: 1 },
    "&.Mui-error fieldset": { borderColor: "#f87171" },
  },
  /* Chrome / Edge / Safari: autofill otherwise forces white background */
  "& .MuiOutlinedInput-input:-webkit-autofill": webkitAutofillField,
  "& .MuiOutlinedInput-input:-webkit-autofill:hover": webkitAutofillField,
  "& .MuiOutlinedInput-input:-webkit-autofill:focus": webkitAutofillField,
  "& .MuiOutlinedInput-input:-webkit-autofill:active": webkitAutofillField,
  "& .MuiOutlinedInput-input::placeholder": {
    color: "rgba(148, 163, 184, 0.9)",
    opacity: 1,
  },
  "& .MuiFormHelperText-root": { marginLeft: 0 },
  "& .MuiFormHelperText-root.Mui-error": { color: "#fca5a5" },
  "& .MuiInputLabel-root": { color: "rgba(203, 213, 225, 0.9)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#93c5fd" },
} as const;

export const INPUT_LABEL_PROPS = {
  sx: {
    "&.MuiInputLabel-shrink": { color: "#cbd5e1" },
    "&.Mui-focused": { color: "#93c5fd" },
  },
} as const;

export const ICON_STYLE = { fontSize: 20, color: "#94a3b8" } as const;
export const SECTION_ICON_STYLE = { fontSize: 18, color: "#93c5fd" } as const;
