"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "@/components/ui/box";

export function PaymentsSkeleton() {
  return (
    <Box className="space-y-8">
      <Box className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </Box>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <Box className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Box
                key={i}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <Box className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Box>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-28" />
                  </Box>
                </Box>
                <Box className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-9 w-28" />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
