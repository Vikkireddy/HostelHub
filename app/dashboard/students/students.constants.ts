export const ID_PROOF_OPTIONS = [
  "Aadhaar",
  "PAN",
  "Passport",
  "Driving License",
  "Voter ID",
  "College ID",
  "Other",
] as const;

/** Validation rules for each ID proof type */
export const ID_PROOF_VALIDATIONS: Record<
  string,
  { pattern: RegExp; message: string; maxLength?: number; placeholder?: string }
> = {
  Aadhaar: {
    pattern: /^[0-9]{12}$/,
    message: "Aadhaar must be exactly 12 digits",
    maxLength: 12,
    placeholder: "12 digits (e.g. 123456789012)",
  },
  PAN: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    message: "PAN must be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)",
    maxLength: 10,
    placeholder: "e.g. ABCDE1234F",
  },
  Passport: {
    pattern: /^[A-Za-z0-9]{6,9}$/,
    message: "Passport number must be 6–9 alphanumeric characters",
    maxLength: 9,
    placeholder: "6–9 alphanumeric characters",
  },
  "Driving License": {
    pattern: /^[A-Za-z0-9]{10,20}$/,
    message: "Driving License must be 10–20 alphanumeric characters",
    maxLength: 20,
    placeholder: "10–20 alphanumeric characters",
  },
  "Voter ID": {
    pattern: /^[A-Za-z0-9]{8,12}$/,
    message: "Voter ID (EPIC) must be 8–12 alphanumeric characters",
    maxLength: 12,
    placeholder: "8–12 alphanumeric characters",
  },
  "College ID": {
    pattern: /^[A-Za-z0-9]{3,20}$/,
    message: "College ID must be 3–20 alphanumeric characters",
    maxLength: 20,
    placeholder: "3–20 alphanumeric characters",
  },
  Other: {
    pattern: /^[A-Za-z0-9\s\-]{3,30}$/,
    message: "ID number must be at least 3 characters",
    maxLength: 30,
    placeholder: "Enter ID number",
  },
};

export function validateIdProof(type: string, value: string): string | null {
  if (!type || !value.trim()) return null;
  const rule = ID_PROOF_VALIDATIONS[type];
  if (!rule) return null;

  let normalized = value.trim();
  if (type === "Aadhaar") {
    normalized = normalized.replace(/\s/g, "");
  }
  if (type === "PAN") {
    normalized = normalized.toUpperCase().replace(/\s/g, "");
  }

  return rule.pattern.test(normalized) ? null : rule.message;
}

export function normalizeIdProof(type: string, value: string): string {
  let v = value.trim();
  if (type === "Aadhaar") v = v.replace(/\s/g, "");
  if (type === "PAN") v = v.toUpperCase().replace(/\s/g, "");
  return v;
}

/** Indian mobile: 10 digits, starting with 6/7/8/9 */
const PHONE_PATTERN = /^[6-9][0-9]{9}$/;

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return "Phone must be 10 digits";
  return PHONE_PATTERN.test(digits) ? null : "Phone must start with 6, 7, 8, or 9";
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export const initialStudentForm = {
  name: "",
  email: "",
  phone: "",
  room_id: "",
  course: "",
  join_date: "",
  id_proof_type: "",
  id_proof_number: "",
  address: "",
} as const;

export type StudentFormValues = {
  name: string;
  email: string;
  phone: string;
  room_id: string;
  course: string;
  join_date: string;
  id_proof_type: string;
  id_proof_number: string;
  address: string;
};
