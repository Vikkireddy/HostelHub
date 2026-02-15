"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "@/components/ui/box";

export function StudentsSkeleton() {
  return (
    <Box className="space-y-8">
      <Box className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </Box>

      <Card>
        <CardHeader>
          <Box className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </Box>
        </CardHeader>
        <CardContent>
          <Box className="space-y-4">
            <Box className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-4 w-16 shrink-0" />
              ))}
            </Box>
            <Box className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Box key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full ml-auto" />
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
