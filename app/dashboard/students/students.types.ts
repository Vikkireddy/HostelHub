import type { ColumnDef } from "@tanstack/react-table";

export interface Student {
  id: string | number;
  name: string;
  email?: string;
  room_number?: string;
  room_id?: number;
  course?: string;
  join_date?: string;
  /** YYYY-MM-DD when student plans to vacate; shown on admin dashboard */
  planned_vacate_date?: string | null;
  phone: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  pending_dues?: number;
  payment_status?: "Overdue" | "No Due Amount" | "Pending";
  payment_count?: number;
}

export interface InactiveStudent extends Student {
  left_date?: string;
}

export interface StudentRoom {
  id: number;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  status: string;
  occupancy?: number;
  rent?: number;
  ac_type?: string;
}

export interface StudentFormValues {
  name: string;
  email: string;
  phone: string;
  room_id: string;
  course: string;
  join_date: string;
  planned_vacate_date: string;
  id_proof_type: string;
  id_proof_number: string;
  address: string;
}

export type StudentFormUpdater = (prev: StudentFormValues) => StudentFormValues;

export interface StudentFormFieldsProps {
  form: StudentFormValues;
  onChange: (updater: StudentFormUpdater) => void;
  rooms: StudentRoom[];
  idPrefix?: string;
  roomCaption?: string;
  idProofError?: string | null;
  phoneError?: string | null;
}

export interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: StudentFormValues;
  onFormChange: (updater: StudentFormUpdater) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error?: Error | null;
  availableRooms: StudentRoom[];
  idProofError?: string | null;
  phoneError?: string | null;
}

export interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  form: StudentFormValues;
  onFormChange: (updater: StudentFormUpdater) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error?: Error | null;
  roomsForEdit: (currentRoomId?: number) => StudentRoom[];
  idProofError?: string | null;
  phoneError?: string | null;
}

export interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onConfirm: () => void;
  isPending: boolean;
}

export interface StudentCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onConfirm: (student: Student) => void;
  isPending: boolean;
}

export interface StudentsTabsProps {
  students: Student[];
  filteredStudents: Student[];
  inactiveStudents: InactiveStudent[];
  filteredInactive: InactiveStudent[];
  inactiveLoading: boolean;
  rooms: StudentRoom[];
  filterRoom: string;
  filterPaymentStatus: string;
  onFilterRoomChange: (value: string) => void;
  onFilterPaymentStatusChange: (value: string) => void;
  onCheckOut: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  canDeleteStudent: (student: Student) => boolean;
}

export interface SearchableStudent {
  name?: string;
  email?: string;
  phone?: string;
  room_number?: string;
  course?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  planned_vacate_date?: string | null;
}

export interface StudentsMuiTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  getRowId: (row: T) => string | number;
}
