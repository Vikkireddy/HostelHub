"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { Step, StepLabel, Stepper } from "@mui/material";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { t } from "@/lib/i18n";
import { AddHostelStepDetails } from "./add-hostel-modal/StepDetails";
import { AddHostelStepAssignUser } from "./add-hostel-modal/StepAssignUser";
import { AddHostelStepReview } from "./add-hostel-modal/StepReview";
import type { AssignMode, ExistingUser, HostelFormState, NewUserFormState, RoleOption } from "./add-hostel-modal/types";

type AddHostelModalProps = {
  open: boolean;
  onClose: () => void;
};

const steps = [
  t("MULTI_ONBOARDING_STEP_DETAILS"),
  t("MULTI_ONBOARDING_STEP_ASSIGN"),
  t("MULTI_ONBOARDING_STEP_REVIEW"),
];

export function AddHostelModal({ open, onClose }: AddHostelModalProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [assignMode, setAssignMode] = useState<AssignMode>("skip");

  const [form, setForm] = useState<HostelFormState>({
    name: "",
    buildingName: "",
    hostelType: "",
    address: "",
    areaLocality: "",
    city: "",
    state: "",
    pincode: "",
    contactPhone: "",
    isActive: true,
  });

  const [newUser, setNewUser] = useState<NewUserFormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleId: 0,
    isActive: true,
  });
  const [selectedExistingUserId, setSelectedExistingUserId] = useState("");
  const [skipConfirmed, setSkipConfirmed] = useState(false);

  const currentHostelId = user?.hostelId ?? null;
  const email = user?.email?.trim().toLowerCase();

  const { data: usersRes } = useQuery({
    queryKey: ["add-hostel-existing-users", currentHostelId],
    enabled: open && Boolean(currentHostelId),
    queryFn: async () => {
      const res = await fetchWithHostel("/api/admins", currentHostelId);
      if (!res.ok) return { users: [] as ExistingUser[] };
      return (await res.json()) as { users: ExistingUser[] };
    },
  });

  const { data: rolesRes } = useQuery({
    queryKey: ["add-hostel-role-options", currentHostelId],
    enabled: open && Boolean(currentHostelId),
    queryFn: async () => {
      const res = await fetchWithHostel("/api/admin-roles", currentHostelId);
      if (!res.ok) return { roles: [] as RoleOption[] };
      return (await res.json()) as { roles: RoleOption[] };
    },
  });

  const users = usersRes?.users ?? [];
  const roles = rolesRes?.roles ?? [];
  const selectedExistingUser = useMemo(
    () => users.find((u) => String(u.id) === selectedExistingUserId) ?? null,
    [users, selectedExistingUserId]
  );

  const closeAndReset = () => {
    setActiveStep(0);
    setAssignMode("skip");
    setSelectedExistingUserId("");
    setSkipConfirmed(false);
    setForm({
      name: "",
      buildingName: "",
      hostelType: "",
      address: "",
      areaLocality: "",
      city: "",
      state: "",
      pincode: "",
      contactPhone: "",
      isActive: true,
    });
    setNewUser({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      roleId: 0,
      isActive: true,
    });
    onClose();
  };

  const createHostelMutation = useMutation({
    mutationFn: async () => {
      if (!email) throw new Error("Admin identity required");
      const createRes = await fetch("/api/hostels", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Email": email },
        body: JSON.stringify({
          name: form.name.trim(),
          buildingName: form.buildingName.trim() || undefined,
          hostelType: form.hostelType || undefined,
          address: form.address.trim() || undefined,
          areaLocality: form.areaLocality.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          pincode: form.pincode.trim() || undefined,
          contactPhone: form.contactPhone.trim() || undefined,
          isActive: form.isActive,
        }),
      });
      const createJson = (await createRes.json()) as {
        success: boolean;
        hostelId?: number;
        hostels?: Array<{ id: number; name: string; city: string | null; state: string | null }>;
        error?: string;
      };
      if (!createRes.ok || !createJson.success || !createJson.hostelId) {
        throw new Error(createJson.error || "Failed to create hostel");
      }

      const createdHostelId = createJson.hostelId;
      if (assignMode === "existing" && selectedExistingUserId) {
        await fetch("/api/hostels/assign-user", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Email": email },
          body: JSON.stringify({
            mode: "existing",
            hostelId: createdHostelId,
            userId: Number(selectedExistingUserId),
          }),
        });
      }
      if (assignMode === "create") {
        await fetch("/api/hostels/assign-user", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Email": email },
          body: JSON.stringify({
            mode: "create",
            hostelId: createdHostelId,
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            phone: newUser.phone.trim(),
            password: newUser.password,
            confirmPassword: newUser.confirmPassword,
            roleId: newUser.roleId,
            isActive: newUser.isActive,
          }),
        });
      }

      updateUser({
        hostelId: createdHostelId,
        accessibleHostels: (createJson.hostels ?? []).map((h) => ({
          id: h.id,
          name: h.name,
          city: h.city,
          state: h.state,
        })),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
      closeAndReset();
    },
  });

  const canGoNextFromStep1 = Boolean(form.name.trim());
  const createUserValidation = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email.trim());
    const phoneOk = /^[0-9]{10}$/.test(newUser.phone.trim());
    const passwordOk = newUser.password.length >= 8;
    const confirmOk = newUser.password === newUser.confirmPassword;
    return (
      Boolean(newUser.name.trim()) &&
      emailOk &&
      phoneOk &&
      passwordOk &&
      confirmOk &&
      newUser.roleId > 0
    );
  }, [
    newUser.name,
    newUser.email,
    newUser.phone,
    newUser.password,
    newUser.confirmPassword,
    newUser.roleId,
  ]);

  const canGoNextFromStep2 =
    assignMode === "create"
      ? createUserValidation
      : assignMode === "existing"
        ? Boolean(selectedExistingUserId)
        : skipConfirmed;

  const canSave = canGoNextFromStep2;

  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeAndReset();
      }}
      headerTitle={t("MULTI_HOSTEL_ADD_HOSTEL")}
      maxWidth="2xl"
      footerComponent={
        <>
          <Button variant="ghost" onClick={activeStep === 0 ? closeAndReset : () => setActiveStep((s) => s - 1)}>
            {activeStep === 0 ? t("MULTI_CANCEL") : t("MULTI_ONBOARDING_BACK")}
          </Button>
          {activeStep < 2 ? (
            <Button
              onClick={() => setActiveStep((s) => s + 1)}
              disabled={activeStep === 0 ? !canGoNextFromStep1 : !canGoNextFromStep2}
            >
              {t("MULTI_ONBOARDING_NEXT")}
            </Button>
          ) : (
            <Button
              disabled={createHostelMutation.isPending || !canSave}
              onClick={() => createHostelMutation.mutate()}
            >
              {t("MULTI_ONBOARDING_SAVE")}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <AddHostelStepDetails form={form} onFormChange={setForm} />
        )}

        {activeStep === 1 && (
          <AddHostelStepAssignUser
            assignMode={assignMode}
            onAssignModeChange={(mode) => {
              setAssignMode(mode);
              if (mode !== "skip") setSkipConfirmed(false);
            }}
            users={users}
            roles={roles}
            selectedExistingUserId={selectedExistingUserId}
            onSelectedExistingUserIdChange={setSelectedExistingUserId}
            newUser={newUser}
            onNewUserChange={setNewUser}
            skipConfirmed={skipConfirmed}
            onSkipConfirmedChange={setSkipConfirmed}
          />
        )}

        {activeStep === 2 && (
          <AddHostelStepReview
            form={form}
            assignMode={assignMode}
            selectedExistingUser={selectedExistingUser}
            newUser={newUser}
          />
        )}
      </div>
    </ModalWithHeaderFooter>
  );
}
