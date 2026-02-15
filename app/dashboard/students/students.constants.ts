export const ID_PROOF_OPTIONS = [
  "Aadhaar",
  "PAN",
  "Passport",
  "Driving License",
  "Voter ID",
  "College ID",
  "Other",
] as const;

export const initialStudentForm = {
  name: "",
  email: "",
  phone: "",
  room_id: "",
  course: "",
  join_date: "",
  id_proof_type: "",
  id_proof_number: "",
  address: "",
} as const;

export type StudentFormValues = {
  name: string;
  email: string;
  phone: string;
  room_id: string;
  course: string;
  join_date: string;
  id_proof_type: string;
  id_proof_number: string;
  address: string;
};
