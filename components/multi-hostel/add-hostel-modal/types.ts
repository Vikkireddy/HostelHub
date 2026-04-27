export type AssignMode = "create" | "existing" | "skip";

export type ExistingUser = {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
};

export type RoleOption = {
  id: number;
  name: string;
};

export type HostelFormState = {
  name: string;
  buildingName: string;
  hostelType: string;
  address: string;
  areaLocality: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
  isActive: boolean;
};

export type NewUserFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  isActive: boolean;
};

export const HOSTEL_TYPE_OPTIONS = [
  { value: "boys", label: "Boys" },
  { value: "girls", label: "Girls" },
  { value: "coed", label: "Coed" },
  { value: "pg", label: "PG" },
  { value: "other", label: "Other" },
] as const;
