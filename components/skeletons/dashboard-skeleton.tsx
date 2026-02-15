"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "@/components/ui/box";

export function DashboardSkeleton() {
  return (
    <Box className="space-y-8">
      <Box>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-36" />
      </Box>

      <Box className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-6">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Box className="flex-1">
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full rounded-full" />
          </CardContent>
        </Card>
      </Box>

      <Box className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <Box className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Box className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </Box>
                  <Skeleton className="h-4 w-16" />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Box className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} className="flex items-center justify-between py-2">
                  <Box className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Box className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
