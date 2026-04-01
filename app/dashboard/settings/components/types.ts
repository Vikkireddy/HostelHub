"use client";

import type { ChangeEvent, FormEvent } from "react";

export type FormSubmitHandler = (e: FormEvent) => void | Promise<void>;
export type TextChangeHandler = (value: string) => void;
export type BooleanChangeHandler = (checked: boolean) => void;
export type FileInputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => void;

export interface ProfileSettingsTabProps {
  displayName: string;
  profileEmail: string;
  profileName: string;
  profileError: string;
  profileLoading: boolean;
  profileSaved: boolean;
  onProfileNameChange: TextChangeHandler;
  onProfileEmailChange: TextChangeHandler;
  onSubmit: FormSubmitHandler;
}

export interface SecuritySettingsTabProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordError: string;
  passwordSuccess: boolean;
  onCurrentPasswordChange: TextChangeHandler;
  onNewPasswordChange: TextChangeHandler;
  onConfirmPasswordChange: TextChangeHandler;
  onSubmit: FormSubmitHandler;
}

export interface NotificationsSettingsTabProps {
  emailNotifications: boolean;
  paymentReminders: boolean;
  notifSaved: boolean;
  onEmailNotificationsChange: BooleanChangeHandler;
  onPaymentRemindersChange: BooleanChangeHandler;
  onSubmit: FormSubmitHandler;
}

export interface BrandingSettingsTabProps {
  hostelId: number | null;
  brandingHostelName: string;
  brandingLogoPreview: string | null;
  brandingSaved: boolean;
  brandingError: string;
  onBrandingHostelNameChange: TextChangeHandler;
  onLogoChange: FileInputChangeHandler;
  onRemoveLogo: () => void;
  onSubmit: FormSubmitHandler;
}
