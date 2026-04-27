"use client";

import { Box } from "@/components/ui/box";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Matches multi-hostel dashboard: title, KPI grid, section bar, carousel strip. */
export function MultiHostelOverviewSkeleton() {
  return (
    <Box className="mx-auto max-w-[1400px] space-y-4">
      <Box>
        <Skeleton className="h-7 w-56 max-w-full" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </Box>

      <Box className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-6 w-32" />
        <Box className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </Box>
      </Box>

      <Box className="flex gap-4 overflow-hidden pb-2">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="h-[280px] w-[min(88vw,300px)] shrink-0 border-slate-200 shadow-sm"
          >
            <Skeleton className="h-32 w-full rounded-t-lg rounded-b-none" />
            <CardContent className="space-y-2 p-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
