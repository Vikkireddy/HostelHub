"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Complaint {
  id: string | number;
  description: string;
  status: string;
  student_name?: string;
  room_number?: string;
}

export default function ComplaintsPage() {
  const { data: complaints = [], isLoading, error } = useQuery<Complaint[]>({
    queryKey: ["complaints"],
    queryFn: () => fetch("/api/complaints").then((r) => r.json()),
  });

  if (isLoading) return <div className="p-8">Loading complaints...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load complaints</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Complaint Management</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Complaint
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${
                      complaint.status === "resolved"
                        ? "bg-green-500"
                        : complaint.status === "in-progress"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{complaint.description}</p>
                    {(complaint.room_number || complaint.student_name) && (
                      <p className="text-sm text-slate-500 mt-1">
                        {complaint.room_number && `Room ${complaint.room_number}`}
                        {complaint.room_number && complaint.student_name ? " - " : ""}
                        {complaint.student_name}
                      </p>
                    )}
                  </div>
                </div>
                <StatusChip status={complaint.status as "open" | "in-progress" | "resolved"} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
