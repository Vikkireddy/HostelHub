"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/EmptyState";
import { Typography } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlannedVacateItem } from "./PlannedVacateItem";
import { RECENT_ITEMS_DISPLAY_LIMIT } from "./dashboard.constants";
import type { PlannedVacatesCardProps } from "./dashboard.types";
import { t } from "@/lib/i18n";

export const PlannedVacatesCard = ({ items }: PlannedVacatesCardProps) => {
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const displayItems = items.slice(0, RECENT_ITEMS_DISPLAY_LIMIT);
  const hasMore = items.length > RECENT_ITEMS_DISPLAY_LIMIT;

  return (
    <>
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
          <Box className="min-w-0 space-y-1">
            <CardTitle className="text-slate-900">{t("PLANNED_VACATES_TITLE")}</CardTitle>
          </Box>
          <Box className="flex shrink-0 flex-col items-end gap-1">
            <Link
              href="/dashboard/students"
              className="text-sm font-medium text-link hover:underline"
            >
              {t("MANAGE")}
            </Link>
            {hasMore && (
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-link hover:underline"
                onClick={() => setViewAllOpen(true)}
              >
                {t("VIEW_ALL")}
              </Button>
            )}
          </Box>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            {items.length === 0 ? (
              <EmptyState
                icon={CalendarRange}
                title={t("PLANNED_VACATES_EMPTY_TITLE")}
                message={t("PLANNED_VACATES_EMPTY_MESSAGE")}
                className="min-h-[250px]"
              />
            ) : (
              <Box className="space-y-4">
                {displayItems.map((item) => (
                  <PlannedVacateItem key={String(item.id)} item={item} />
                ))}
              </Box>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{t("PLANNED_VACATES_TITLE")}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1 -mx-6 px-6">
            <Box className="space-y-4 pr-4 pb-2">
              {items.map((item) => (
                <PlannedVacateItem key={String(item.id)} item={item} />
              ))}
            </Box>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
