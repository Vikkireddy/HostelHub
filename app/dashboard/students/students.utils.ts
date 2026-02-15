type SearchableStudent = {
  name?: string;
  email?: string;
  phone?: string;
  room_number?: string;
  course?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
};

export function filterStudents<T extends SearchableStudent>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (s) =>
      (s.name ?? "").toLowerCase().includes(q) ||
      (s.email ?? "").toLowerCase().includes(q) ||
      (s.phone ?? "").toLowerCase().includes(q) ||
      (s.room_number ?? "").toLowerCase().includes(q) ||
      (s.course ?? "").toLowerCase().includes(q) ||
      (s.id_proof_type ?? "").toLowerCase().includes(q) ||
      (s.id_proof_number ?? "").toLowerCase().includes(q) ||
      (s.address ?? "").toLowerCase().includes(q)
  );
}
