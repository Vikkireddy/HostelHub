"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BedDouble, DoorOpen, Users, Wrench, Plus, Inbox, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/StatusChip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoomsSkeleton } from "@/components/skeletons";
import { useSearchStore } from "@/lib/SearchStore";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { VALID_AC_TYPES, DEFAULT_AC_TYPE } from "./rooms.constants";

interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  ac_type?: string;
  capacity: number;
  occupancy: number;
  status: string;
  rent: number;
}

const initialForm = {
  number: "",
  floor: "",
  type: "",
  ac_type: DEFAULT_AC_TYPE,
  capacity: "",
  rent: "",
  status: "available",
};

function filterRooms<T extends { number: string; floor: number; type: string }>(
  rooms: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rooms;
  return rooms.filter(
    (r) =>
      r.number.toLowerCase().includes(q) ||
      String(r.floor).includes(q) ||
      r.type.toLowerCase().includes(q)
  );
}

export default function RoomsPage() {
  const queryClient = useQueryClient();
  const { query } = useSearchStore();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);

  const { data: rooms = [], isLoading, error } = useQuery<Room[]>({
    queryKey: ["rooms", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/rooms", hostelId).then((r) => r.json()),
  });

  const updateRoom = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: typeof initialForm;
    }) => {
      const res = await fetchWithHostel(`/api/rooms/${id}`, hostelId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: data.number,
          floor: Number(data.floor),
          type: data.type,
          ac_type: data.ac_type,
          capacity: Number(data.capacity),
          rent: Number(data.rent),
          status: data.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update room");
      }
      return res.json();
    },
    onSuccess: (updatedRoom: Room) => {
      queryClient.setQueryData<Room[]>(["rooms", hostelId], (old) => {
        if (!old) return old;
        return old.map((r) =>
          r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r
        );
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setEditForm(initialForm);
      setEditModalOpen(false);
      setEditingRoom(null);
    },
  });

  const createRoom = useMutation({
    mutationFn: async (data: typeof initialForm) => {
      const res = await fetchWithHostel("/api/rooms", hostelId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: data.number,
          floor: Number(data.floor),
          type: data.type,
          ac_type: data.ac_type,
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
    if (!form.number.trim() || !form.floor || !form.type || !form.ac_type || !form.capacity || !form.rent) return;
    createRoom.mutate(form);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setEditForm({
      number: room.number,
      floor: String(room.floor),
      type: room.type,
      ac_type: room.ac_type || DEFAULT_AC_TYPE,
      capacity: String(room.capacity),
      rent: String(room.rent),
      status: room.status,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editForm.number.trim() || !editForm.floor || !editForm.type || !editForm.ac_type || !editForm.capacity || !editForm.rent)
      return;
    updateRoom.mutate({ id: editingRoom.id, data: editForm });
  };

  const deleteRoom = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithHostel(`/api/rooms/${id}`, hostelId, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete room");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    },
  });

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const filteredRooms = useMemo(() => filterRooms(rooms, query), [rooms, query]);
  const totalRooms = filteredRooms.length;
  const available = filteredRooms.filter((r) => r.status === "available").length;
  const occupied = filteredRooms.filter((r) => r.status === "full").length;
  const maintenance = filteredRooms.filter((r) => r.status === "maintenance").length;

  if (isLoading) return <RoomsSkeleton />;
  if (error) return <Box className="p-8 text-red-600">Failed to load rooms</Box>;

  return (
    <Box className="space-y-8">
      <Box className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Box className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <BedDouble className="h-6 w-6 text-blue-600" />
            </Box>
            <Box>
              <Typography className="text-2xl font-bold">{totalRooms}</Typography>
              <Typography variant="muted">Total Rooms</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Box className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DoorOpen className="h-6 w-6 text-green-600" />
            </Box>
            <Box>
              <Typography className="text-2xl font-bold">{available}</Typography>
              <Typography variant="muted">Available</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Box className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Users className="h-6 w-6 text-amber-600" />
            </Box>
            <Box>
              <Typography className="text-2xl font-bold">{occupied}</Typography>
              <Typography variant="muted">Occupied</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Box className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Wrench className="h-6 w-6 text-orange-600" />
            </Box>
            <Box>
              <Typography className="text-2xl font-bold">{maintenance}</Typography>
              <Typography variant="muted">Maintenance</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Box className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Rooms</h3>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </Box>

        <Dialog
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) setEditingRoom(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Room</DialogTitle>
              <DialogDescription>
                Update room details. Capacity cannot be reduced below current occupancy.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {updateRoom.isError && (
                <Typography variant="error">{updateRoom.error?.message}</Typography>
              )}
              <Box className="space-y-2">
                <RequiredLabel htmlFor="edit-number">Room Number</RequiredLabel>
                <Input
                  id="edit-number"
                  value={editForm.number}
                  onChange={(e) => setEditForm((f) => ({ ...f, number: e.target.value }))}
                  placeholder="e.g. 101"
                  required
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="edit-floor">Floor</RequiredLabel>
                <Input
                  id="edit-floor"
                  type="number"
                  min={1}
                  value={editForm.floor}
                  onChange={(e) => setEditForm((f) => ({ ...f, floor: e.target.value }))}
                  placeholder="e.g. 1"
                  required
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="edit-type">Type</RequiredLabel>
                <Dropdown
                  value={editForm.type}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, type: v }))}
                  options={[
                    { value: "Single", label: "Single" },
                    { value: "Double", label: "Double" },
                    { value: "Triple", label: "Triple" },
                  ]}
                  placeholder="Select type"
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="edit-ac-type">AC / Non-AC</RequiredLabel>
                <Dropdown
                  value={editForm.ac_type}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, ac_type: v }))}
                  options={VALID_AC_TYPES.map((t) => ({ value: t, label: t }))}
                  placeholder="Select"
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="edit-capacity">Capacity</RequiredLabel>
                <Input
                  id="edit-capacity"
                  type="number"
                  min={editingRoom?.occupancy ?? 1}
                  value={editForm.capacity}
                  onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="e.g. 1"
                  required
                />
                {editingRoom && (
                  <Typography variant="caption">
                    Min: {editingRoom.occupancy} (current occupancy)
                  </Typography>
                )}
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="edit-rent">Rent (₹/month)</RequiredLabel>
                <Input
                  id="edit-rent"
                  type="number"
                  min={0}
                  value={editForm.rent}
                  onChange={(e) => setEditForm((f) => ({ ...f, rent: e.target.value }))}
                  placeholder="e.g. 5000"
                  required
                />
              </Box>
              <Box className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Dropdown
                  value={editForm.status}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
                  options={[
                    { value: "available", label: "Available" },
                    { value: "maintenance", label: "Maintenance" },
                  ]}
                  placeholder="Select status"
                />
              </Box>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateRoom.isPending}>
                  {updateRoom.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteModalOpen}
          onOpenChange={(open) => {
            setDeleteModalOpen(open);
            if (!open) setRoomToDelete(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Room</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete Room {roomToDelete?.number}? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleteRoom.isPending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => roomToDelete && deleteRoom.mutate(roomToDelete.id)} disabled={deleteRoom.isPending}>
                {deleteRoom.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                <Typography variant="error">{createRoom.error?.message}</Typography>
              )}
              <Box className="space-y-2">
                <RequiredLabel htmlFor="number">Room Number</RequiredLabel>
                <Input
                  id="number"
                  value={form.number}
                  onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                  placeholder="e.g. 101"
                  required
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="floor">Floor</RequiredLabel>
                <Input
                  id="floor"
                  type="number"
                  min={1}
                  value={form.floor}
                  onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                  placeholder="e.g. 1"
                  required
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="type">Type</RequiredLabel>
                <Dropdown
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  options={[
                    { value: "Single", label: "Single" },
                    { value: "Double", label: "Double" },
                    { value: "Triple", label: "Triple" },
                  ]}
                  placeholder="Select type"
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="ac-type">AC / Non-AC</RequiredLabel>
                <Dropdown
                  value={form.ac_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, ac_type: v }))}
                  options={VALID_AC_TYPES.map((t) => ({ value: t, label: t }))}
                  placeholder="Select"
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="capacity">Capacity</RequiredLabel>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="e.g. 1"
                  required
                />
              </Box>
              <Box className="space-y-2">
                <RequiredLabel htmlFor="rent">Rent (₹/month)</RequiredLabel>
                <Input
                  id="rent"
                  type="number"
                  min={0}
                  value={form.rent}
                  onChange={(e) => setForm((f) => ({ ...f, rent: e.target.value }))}
                  placeholder="e.g. 5000"
                  required
                />
              </Box>
              <Box className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Dropdown
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  options={[
                    { value: "available", label: "Available" },
                    { value: "maintenance", label: "Maintenance" },
                  ]}
                  placeholder="Select status"
                />
              </Box>
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

        {rooms.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No rooms found"
            message="Add rooms using the Add Room button above"
            className="min-h-[280px]"
          />
        ) : (
        <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredRooms.map((room) => {
            const occupancyPercent = (room.occupancy / room.capacity) * 100;
            const progressVariant =
              room.status === "full"
                ? "danger"
                : room.status === "available" && room.occupancy > 0
                ? "warning"
                : "default";
            return (
              <Card key={room.id} className="group overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <Box className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">Room {room.number}</span>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <StatusChip status={room.status as "available" | "full" | "maintenance"} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-slate-700 hover:bg-slate-100"
                      onClick={() => handleEdit(room)}
                      title="Edit room"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                      onClick={() => handleDeleteRoom(room)}
                      disabled={room.occupancy > 0}
                      title={room.occupancy > 0 ? "Cannot delete room with occupants" : "Delete room"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Box>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Typography variant="muted">Floor {room.floor}</Typography>
                  <Box>
                    <Typography className="text-sm">
                      <span className="text-slate-500">Type:</span> {room.type} · {room.ac_type || DEFAULT_AC_TYPE}
                    </Typography>
                    <Typography className="text-sm">
                      <span className="text-slate-500">Occupancy:</span>{" "}
                      {room.occupancy}/{room.capacity}
                    </Typography>
                  </Box>
                  <Progress
                    value={occupancyPercent}
                    variant={progressVariant}
                    className="h-2"
                  />
                  <Typography className="text-sm font-medium">
                    <span className="text-slate-500">Rent:</span> ₹
                    {room.rent.toLocaleString()}/mo
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
        )}
      </Box>
    </Box>
  );
}
