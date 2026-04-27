"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/EmptyState";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { PaymentItem } from "./PaymentItem";
import { RECENT_ITEMS_DISPLAY_LIMIT } from "./dashboard.constants";
import type { RecentPaymentsProps } from "./dashboard.types";
import { t } from "@/lib/i18n";

export function RecentPayments({ payments }: RecentPaymentsProps) {
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const displayPayments = payments.slice(0, RECENT_ITEMS_DISPLAY_LIMIT);
  const hasMore = payments.length > RECENT_ITEMS_DISPLAY_LIMIT;

  return (
    <>
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900">{t("RECENT_PAYMENTS")}</CardTitle>
          {hasMore && (
            <Button
              variant="link"
              className="h-auto p-0 text-sm text-link hover:underline"
              onClick={() => setViewAllOpen(true)}
            >
              {t("VIEW_ALL")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            {payments.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={t("NO_PAYMENTS_FOUND")}
                message={t("PAYMENTS_EMPTY_MESSAGE")}
                className="min-h-[250px]"
              />
            ) : (
              <Box className="space-y-4">
                {displayPayments.map((payment) => (
                  <PaymentItem key={payment.id} payment={payment} />
                ))}
              </Box>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <ModalWithHeaderFooter
        open={viewAllOpen}
        onOpenChange={setViewAllOpen}
        maxWidth="2xl"
        className="max-h-[85vh]"
        headerTitle={t("RECENT_PAYMENTS")}
        bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden !px-0 !py-0"
        children={
          <ScrollArea className="min-h-0 flex-1 px-6">
            <Box className="space-y-4 pr-4">
              {payments.map((payment) => (
                <PaymentItem key={payment.id} payment={payment} />
              ))}
            </Box>
          </ScrollArea>
        }
      />
    </>
  );
}
