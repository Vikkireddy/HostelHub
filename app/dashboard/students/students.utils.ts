import type { SearchableStudent } from "./students.types";

export function filterStudents<T extends SearchableStudent>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (s) =>
      (s.name ?? "").toLowerCase().includes(q) ||
      (s.gender ?? "").toLowerCase().includes(q) ||
      (s.email ?? "").toLowerCase().includes(q) ||
      (s.phone ?? "").toLowerCase().includes(q) ||
      (s.emergency_contact_phone ?? "").toLowerCase().includes(q) ||
      (s.room_number ?? "").toLowerCase().includes(q) ||
      (s.course ?? "").toLowerCase().includes(q) ||
      (s.id_proof_type ?? "").toLowerCase().includes(q) ||
      (s.id_proof_number ?? "").toLowerCase().includes(q) ||
      (s.address ?? "").toLowerCase().includes(q) ||
      (s.planned_vacate_date ?? "").toLowerCase().includes(q) ||
      String(s.security_deposit_amount ?? "").toLowerCase().includes(q)
  );
}
