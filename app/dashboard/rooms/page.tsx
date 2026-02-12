"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BedDouble, DoorOpen, Users, Wrench, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Progress } from "@/components/ui/progress";
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

interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  occupancy: number;
  status: string;
  rent: number;
}

const initialForm = {
  number: "",
  floor: "",
  type: "",
  capacity: "",
  rent: "",
  status: "available",
};

export default function RoomsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const { data: rooms = [], isLoading, error } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: () => fetch("/api/rooms").then((r) => r.json()),
  });

  const createRoom = useMutation({
    mutationFn: async (data: typeof initialForm) => {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: data.number,
          floor: Number(data.floor),
          type: data.type,
          capacity: Number(data.capacity),
          rent: Number(data.rent),
          status: data.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add room");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setForm(initialForm);
      setModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number.trim() || !form.floor || !form.type || !form.capacity || !form.rent) return;
    createRoom.mutate(form);
  };

  const totalRooms = rooms.length;
  const available = rooms.filter((r) => r.status === "available").length;
  const occupied = rooms.filter((r) => r.status === "full").length;
  const maintenance = rooms.filter((r) => r.status === "maintenance").length;

  if (isLoading) return <div className="p-8">Loading rooms...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load rooms</div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <BedDouble className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRooms}</p>
              <p className="text-sm text-slate-500">Total Rooms</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DoorOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{available}</p>
              <p className="text-sm text-slate-500">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{occupied}</p>
              <p className="text-sm text-slate-500">Occupied</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{maintenance}</p>
              <p className="text-sm text-slate-500">Maintenance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Rooms</h3>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Room</DialogTitle>
              <DialogDescription>
                Create a new room. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {createRoom.isError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {createRoom.error?.message}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="number">Room Number *</Label>
                <Input
                  id="number"
                  value={form.number}
                  onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                  placeholder="e.g. 101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor *</Label>
                <Input
                  id="floor"
                  type="number"
                  min={1}
                  value={form.floor}
                  onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                  placeholder="e.g. 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Triple">Triple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="e.g. 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent">Rent (₹/month) *</Label>
                <Input
                  id="rent"
                  type="number"
                  min={0}
                  value={form.rent}
                  onChange={(e) => setForm((f) => ({ ...f, rent: e.target.value }))}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createRoom.isPending}>
                  {createRoom.isPending ? "Adding..." : "Add Room"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => {
            const occupancyPercent = (room.occupancy / room.capacity) * 100;
            const progressVariant =
              room.status === "full"
                ? "danger"
                : room.status === "available" && room.occupancy > 0
                ? "warning"
                : "default";
            return (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">Room {room.number}</span>
                  </div>
                  <StatusChip status={room.status as "available" | "full" | "maintenance"} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500">Floor {room.floor}</p>
                  <div>
                    <p className="text-sm">
                      <span className="text-slate-500">Type:</span> {room.type}
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">Occupancy:</span>{" "}
                      {room.occupancy}/{room.capacity}
                    </p>
                  </div>
                  <Progress
                    value={occupancyPercent}
                    variant={progressVariant}
                    className="h-2"
                  />
                  <p className="text-sm font-medium">
                    <span className="text-slate-500">Rent:</span> ₹
                    {room.rent.toLocaleString()}/mo
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
