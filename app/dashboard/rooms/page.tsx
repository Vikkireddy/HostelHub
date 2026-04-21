"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoomsSkeleton } from "@/components/skeletons";
import { useSearchStore } from "@/lib/SearchStore";
import { useAuthStore } from "@/lib/AuthStore";
import { hasDashboardPermission } from "@/lib/dashboardPermissionClient";
import { fetchWithHostel } from "@/lib/ApiClient";
import { DEFAULT_AC_TYPE } from "./rooms.constants";
import { AddRoomDialog } from "./components/AddRoomDialog";
import { DeleteRoomDialog } from "./components/DeleteRoomDialog";
import { EditRoomDialog } from "./components/EditRoomDialog";
import { RoomCard } from "./components/RoomCard";
import { RoomsSummaryCards } from "./components/RoomsSummaryCards";
import { Room, RoomForm, initialForm } from "./components/types";

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
  const query = useSearchStore((s) => s.query);
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const canRoomsAdd = hasDashboardPermission(user, "rooms", "add");
  const canRoomsEdit = hasDashboardPermission(user, "rooms", "edit");
  const canRoomsDelete = hasDashboardPermission(user, "rooms", "delete");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomForm>(initialForm);
  const [editForm, setEditForm] = useState<RoomForm>(initialForm);

  const { data: rooms = [], isLoading, error } = useQuery<Room[]>({
    queryKey: ["rooms", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/rooms", hostelId).then((r) => r.json()),
    enabled: Boolean(hostelId),
  });

  const updateRoom = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: RoomForm;
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
    mutationFn: async (data: RoomForm) => {
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

  const handleSubmit = (e: FormEvent) => {
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

  const handleEditSubmit = (e: FormEvent) => {
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
      <RoomsSummaryCards
        totalRooms={totalRooms}
        available={available}
        occupied={occupied}
        maintenance={maintenance}
      />

      <Box>
        <Box className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Rooms</h3>
          <Button
            onClick={() => setModalOpen(true)}
            disabled={!canRoomsAdd}
            title={!canRoomsAdd ? "You don't have permission to add rooms" : undefined}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </Box>

        <EditRoomDialog
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) setEditingRoom(null);
          }}
          form={editForm}
          setForm={setEditForm}
          editingRoom={editingRoom}
          onSubmit={handleEditSubmit}
          isError={updateRoom.isError}
          errorMessage={updateRoom.error?.message}
          isPending={updateRoom.isPending}
        />

        <DeleteRoomDialog
          open={deleteModalOpen}
          onOpenChange={(open) => {
            setDeleteModalOpen(open);
            if (!open) setRoomToDelete(null);
          }}
          roomToDelete={roomToDelete}
          onConfirm={() => roomToDelete && deleteRoom.mutate(roomToDelete.id)}
          isPending={deleteRoom.isPending}
        />

        <AddRoomDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          isError={createRoom.isError}
          errorMessage={createRoom.error?.message}
          isPending={createRoom.isPending}
        />

        {rooms.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No rooms found"
            message="Add rooms using the Add Room button above"
            className="min-h-[280px]"
          />
        ) : (
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleEdit}
                onDelete={handleDeleteRoom}
                canEdit={canRoomsEdit}
                canDelete={canRoomsDelete}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
