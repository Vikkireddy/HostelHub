import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import type { FieldPath } from "react-hook-form";
import type { SignupFormValues } from "@/lib/validations/signup";
import type { EnKeys } from "@/lib/i18n";

export interface SignupFieldConfig {
  name: FieldPath<SignupFormValues>;
  labelKey: EnKeys;
  placeholderKey: EnKeys;
  type?: "text" | "email" | "password";
  icon: React.ReactNode;
  sx?: object;
  required?: boolean;
}

export interface SignupSectionConfig {
  id: string;
  icon: React.ReactNode;
  titleKey: EnKeys;
  columns?: 1 | 2 | 3;
  fields: SignupFieldConfig[];
}

export const SIGNUP_SECTIONS: SignupSectionConfig[] = [
  {
    id: "hostel",
    icon: <BusinessIcon />,
    titleKey: "SIGNUP_HOSTEL_DETAILS",
    columns: 2,
    fields: [
      { name: "hostelName", labelKey: "SIGNUP_HOSTEL_NAME", placeholderKey: "SIGNUP_HOSTEL_NAME_PLACEHOLDER", icon: <BusinessIcon />, required: true },
      { name: "ownerName", labelKey: "SIGNUP_OWNER_NAME", placeholderKey: "SIGNUP_OWNER_NAME_PLACEHOLDER", icon: <PersonIcon />, required: true },
      { name: "email", labelKey: "SIGNUP_EMAIL_ADDRESS", placeholderKey: "SIGNUP_EMAIL_PLACEHOLDER", type: "email", icon: <EmailIcon />, required: true },
      { name: "mobile", labelKey: "SIGNUP_MOBILE_NUMBER", placeholderKey: "SIGNUP_MOBILE_PLACEHOLDER", icon: <PhoneIcon />, required: true },
    ],
  },
  {
    id: "address",
    icon: <LocationIcon />,
    titleKey: "SIGNUP_ADDRESS_OPTIONAL",
    columns: 3,
    fields: [
      { name: "address", labelKey: "SIGNUP_ADDRESS", placeholderKey: "SIGNUP_ADDRESS_PLACEHOLDER", icon: <LocationIcon />, sx: { gridColumn: { xs: "1", sm: "1 / -1" } } },
      { name: "city", labelKey: "SIGNUP_CITY", placeholderKey: "SIGNUP_CITY_PLACEHOLDER", icon: <LocationIcon /> },
      { name: "state", labelKey: "SIGNUP_STATE", placeholderKey: "SIGNUP_STATE_PLACEHOLDER", icon: <LocationIcon /> },
      { name: "pincode", labelKey: "SIGNUP_PINCODE", placeholderKey: "SIGNUP_PINCODE_PLACEHOLDER", icon: <LocationIcon /> },
    ],
  },
  {
    id: "credentials",
    icon: <LockIcon />,
    titleKey: "SIGNUP_ACCOUNT_CREDENTIALS",
    columns: 2,
    fields: [
      { name: "password", labelKey: "SIGNUP_PASSWORD", placeholderKey: "SIGNUP_PASSWORD_PLACEHOLDER", type: "password", icon: <LockIcon />, required: true },
      { name: "confirmPassword", labelKey: "SIGNUP_CONFIRM_PASSWORD", placeholderKey: "SIGNUP_CONFIRM_PASSWORD_PLACEHOLDER", type: "password", icon: <LockIcon />, required: true },
    ],
  },
];
