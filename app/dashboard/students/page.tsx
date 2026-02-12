"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Student {
  id: string | number;
  name: string;
  room_number?: string;
  room_id?: number;
  course: string;
  join_date?: string;
  phone: string;
}

interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  occupancy?: number;
  status: string;
  rent?: number;
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  room_id: "",
  course: "",
  join_date: "",
};

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const { data: students = [], isLoading, error } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => fetch("/api/students").then((r) => r.json()),
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: () => fetch("/api/rooms").then((r) => r.json()),
  });

  const createStudent = useMutation({
    mutationFn: async (data: typeof initialForm) => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email || null,
          phone: data.phone,
          room_id: data.room_id ? Number(data.room_id) : null,
          course: data.course || null,
          join_date: data.join_date || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setForm(initialForm);
      setModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    createStudent.mutate(form);
  };

  const availableRooms = rooms.filter(
    (r) => r.status !== "maintenance" && (r.occupancy ?? 0) < r.capacity
  );

  if (isLoading) return <div className="p-8">Loading students...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load students</div>;

  const room = (s: Student) => s.room_number || "-";
  const joinDate = (s: Student) => (s.join_date ? new Date(s.join_date).toISOString().slice(0, 10) : "-");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Student Management</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>
              Enter student details. Name and phone are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {createStudent.isError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {createStudent.error?.message}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="student@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Mobile number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Assign to Room</Label>
              <Select
                value={form.room_id || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, room_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select which room this student belongs to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No room assigned</SelectItem>
                  {availableRooms.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      Room {r.number} (Floor {r.floor}, {r.type}) — ₹{Number(r.rent || 0).toLocaleString()}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {availableRooms.length === 0
                  ? "No rooms available. Add rooms from the Rooms page first."
                  : "Choose the room this student will be assigned to. Only available rooms are shown."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={form.course}
                onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                placeholder="e.g. B.Tech CSE"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="join_date">Join Date</Label>
              <Input
                id="join_date"
                type="date"
                value={form.join_date}
                onChange={(e) => setForm((f) => ({ ...f, join_date: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending ? "Saving..." : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">All Students</CardTitle>
          <CardDescription>Manage student records and room allocations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Room</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Course</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Join Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-200 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{room(student)}</td>
                    <td className="px-6 py-4 text-slate-700">{student.course || "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{joinDate(student)}</td>
                    <td className="px-6 py-4 text-slate-700">{student.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
