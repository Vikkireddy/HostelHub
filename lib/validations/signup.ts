import { z } from "zod";
import { en } from "@/lib/i18n";

const passwordSchema = z
  .string()
  .min(8, en.SIGNUP_ERROR_PASSWORD_MIN)
  .regex(/[A-Z]/, en.SIGNUP_ERROR_PASSWORD_UPPERCASE)
  .regex(/\d/, en.SIGNUP_ERROR_PASSWORD_NUMBER)
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, en.SIGNUP_ERROR_PASSWORD_SPECIAL);

export const signupSchema = z
  .object({
    hostelName: z.string().min(1, en.SIGNUP_ERROR_HOSTEL_REQUIRED),
    ownerName: z.string().min(1, en.SIGNUP_ERROR_OWNER_REQUIRED),
    email: z.string().min(1, en.SIGNUP_ERROR_EMAIL_REQUIRED).email(en.SIGNUP_ERROR_EMAIL_INVALID),
    mobile: z
      .string()
      .min(1, en.SIGNUP_ERROR_MOBILE_REQUIRED)
      .regex(/^[0-9]{10}$/, en.SIGNUP_ERROR_MOBILE_INVALID),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, en.SIGNUP_ERROR_CONFIRM_REQUIRED),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: en.SIGNUP_ERROR_TERMS_REQUIRED,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: en.SIGNUP_ERROR_PASSWORDS_MISMATCH,
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
