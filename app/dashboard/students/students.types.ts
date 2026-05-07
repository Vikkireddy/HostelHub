import type { ColumnDef } from "@tanstack/react-table";
import type { ResidentKind } from "@/lib/residentType.constants";

export interface Student {
  id: string | number;
  name: string;
  gender?: string | null;
  email?: string;
  room_number?: string;
  room_id?: number;
  course?: string;
  /** student | employee | job_seeker | other */
  resident_type?: ResidentKind | string | null;
  /** Type-specific fields stored as JSON on the server */
  resident_type_details?: Record<string, string> | null;
  join_date?: string;
  /** YYYY-MM-DD when resident plans to vacate; shown on admin dashboard */
  planned_vacate_date?: string | null;
  phone?: string | null;
  emergency_contact_phone?: string | null;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  pending_dues?: number;
  payment_status?: "Overdue" | "No Due Amount" | "Pending";
  payment_count?: number;
  /** Advance / security deposit collected at joining (optional). */
  security_deposit_amount?: number | string | null;
  /** Monthly rent charged to this resident (can vary by resident). */
  monthly_rent?: number | string | null;
}

export interface InactiveStudent extends Student {
  left_date?: string;
  security_deposit_deduction?: number | string | null;
  security_deposit_refund?: number | string | null;
}

export interface StudentRoom {
  id: number;
  number: string;
  floor: number;
  capacity: number;
  status: string;
  occupancy?: number;
  ac_type?: string;
}

/** Optional files collected in Add Resident; uploaded after the resident row is created. */
export interface ResidentInitialDocuments {
  profilePhoto: File | null;
  idProofFile: File | null;
}

export interface StudentDocumentRow {
  id: number;
  student_id: number;
  category: string;
  label: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string | null;
}

export interface StudentFormValues {
  name: string;
  gender: string;
  email: string;
  phone: string;
  emergency_contact_phone: string;
  room_id: string;
  course: string;
  join_date: string;
  planned_vacate_date: string;
  id_proof_type: string;
  id_proof_number: string;
  address: string;
  /** Raw input for optional advance / security deposit */
  security_deposit_amount: string;
  monthly_rent: string;
  resident_type: ResidentKind;
  resident_type_details: Record<string, string>;
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
  emergencyPhoneError?: string | null;
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
  emergencyPhoneError?: string | null;
  documents: ResidentInitialDocuments;
  onDocumentsChange: (next: ResidentInitialDocuments) => void;
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
  emergencyPhoneError?: string | null;
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
  onConfirm: (student: Student, options: { securityDepositDeduction: number }) => void;
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
  onViewDetails?: (student: Student) => void;
  onCheckOut: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  canDeleteStudent: (student: Student) => boolean;
  /** When false, row actions for edit / checkout / delete are disabled (RBAC). */
  canEditResident: boolean;
  canCheckOutResident: boolean;
  canDeleteResident: boolean;
}

export interface SearchableStudent {
  name?: string;
  gender?: string | null;
  email?: string;
  phone?: string | null;
  emergency_contact_phone?: string | null;
  room_number?: string;
  room_id?: number;
  course?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  planned_vacate_date?: string | null;
  payment_status?: string;
  security_deposit_amount?: number | string | null;
  monthly_rent?: number | string | null;
}

export interface StudentsMuiTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  getRowId: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}
