"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "@/components/ui/box";

export function RoomsSkeleton() {
  return (
    <Box className="space-y-8">
      <Box className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-6">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Box>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-20" />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </Box>

      <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
              <Box className="flex justify-between pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
