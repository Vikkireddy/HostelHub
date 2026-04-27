"use client";

import { Box, Drawer } from "@mui/material";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/lib/AuthStore";
import { useSettingsStore } from "@/lib/SettingsStore";
import type { Student } from "./students.types";
import { ResidentTypeDrawerTab } from "./ResidentTypeDrawerTab";
import { ResidentDetailsDrawerAddDocumentDialog } from "./resident-details-drawer/ResidentDetailsDrawerAddDocumentDialog";
import { ResidentDetailsDrawerDocumentsTab } from "./resident-details-drawer/ResidentDetailsDrawerDocumentsTab";
import { ResidentDetailsDrawerFooter } from "./resident-details-drawer/ResidentDetailsDrawerFooter";
import { ResidentDetailsDrawerHeader } from "./resident-details-drawer/ResidentDetailsDrawerHeader";
import { ResidentDetailsDrawerOverviewTab } from "./resident-details-drawer/ResidentDetailsDrawerOverviewTab";
import { ResidentDetailsDrawerPaymentsTab } from "./resident-details-drawer/ResidentDetailsDrawerPaymentsTab";
import { useResidentDetailsDrawerData } from "./resident-details-drawer/useResidentDetailsDrawerData";

export const ResidentDetailsDrawer = ({
  open,
  onOpenChange,
  student,
  canEditResidents = true,
  canViewDocuments = true,
  canAddDocuments = true,
  canDeleteDocuments = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  canEditResidents?: boolean;
  canViewDocuments?: boolean;
  canAddDocuments?: boolean;
  canDeleteDocuments?: boolean;
}) => {
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const paymentTrackingEnabled = useSettingsStore((s) => s.getPaymentTrackingEnabled(hostelId));
  const {
    avatarUrl,
    documents,
    docsLoading,
    paymentData,
    payLoading,
    deletePending,
    uploadPending,
    addOpen,
    setAddOpen,
    addLabel,
    setAddLabel,
    addFile,
    setAddFile,
    handleViewOrDownload,
    handleAddSubmit,
    handleDeleteDoc,
  } = useResidentDetailsDrawerData(open, student);

  const close = () => onOpenChange(false);

  if (!student) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 720, md: 820 },
          maxWidth: "100vw",
          height: "100%",
          maxHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderLeft: "1px solid rgb(226 232 240)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <ResidentDetailsDrawerHeader student={student} avatarUrl={avatarUrl} onClose={close} />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            px: 2,
            py: 2,
          }}
        >
          <Tabs defaultValue="overview" className="flex min-h-0 w-full flex-1 flex-col">
            <TabsList className="grid w-full shrink-0 grid-cols-2 gap-1 sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                {t("RESIDENT_DETAILS_TAB_OVERVIEW")}
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">
                {t("RESIDENT_DETAILS_TAB_DOCUMENTS")}
              </TabsTrigger>
              <TabsTrigger value="resident-type" className="text-xs sm:text-sm">
                {t("RESIDENT_DETAILS_TAB_RESIDENT_TYPE")}
              </TabsTrigger>
              {paymentTrackingEnabled ? (
                <TabsTrigger value="payments" className="text-xs sm:text-sm">
                  {t("RESIDENT_DETAILS_TAB_PAYMENTS")}
                </TabsTrigger>
              ) : null}
            </TabsList>

            <ResidentDetailsDrawerOverviewTab student={student} />

            <ResidentDetailsDrawerDocumentsTab
              documents={documents}
              docsLoading={docsLoading}
              deletePending={deletePending}
              onAddClick={() => setAddOpen(true)}
              onViewOrDownload={handleViewOrDownload}
              onDeleteDoc={handleDeleteDoc}
              canViewDocuments={canViewDocuments}
              canAddDocuments={canAddDocuments}
              canDeleteDocuments={canDeleteDocuments}
            />

            <TabsContent value="resident-type" className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <ResidentTypeDrawerTab student={student} readOnly={!canEditResidents} />
            </TabsContent>

            {paymentTrackingEnabled ? (
              <ResidentDetailsDrawerPaymentsTab paymentData={paymentData} payLoading={payLoading} />
            ) : null}
          </Tabs>
        </Box>

        <ResidentDetailsDrawerFooter onClose={close} />
      </Box>

      <ResidentDetailsDrawerAddDocumentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        addLabel={addLabel}
        onAddLabelChange={setAddLabel}
        addFile={addFile}
        onAddFileChange={setAddFile}
        onSubmit={handleAddSubmit}
        uploadPending={uploadPending}
      />
    </Drawer>
  );
};
