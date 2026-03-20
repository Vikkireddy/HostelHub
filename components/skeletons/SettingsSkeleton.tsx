"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "@/components/ui/box";

export function SettingsSkeleton() {
  return (
    <Box className="mx-auto max-w-3xl space-y-6">
      <Box className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0" />
        ))}
      </Box>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Box className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Box className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </Box>
          </Box>
          <Box className="space-y-4">
            <Box className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </Box>
            <Box className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </Box>
            <Skeleton className="h-10 w-32" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
