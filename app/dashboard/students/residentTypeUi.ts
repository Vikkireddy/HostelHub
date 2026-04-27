import type { EnKeys } from "@/lib/i18n";
import type { ResidentKind } from "@/lib/residentType.constants";

export const RESIDENT_KIND_LABEL: Record<ResidentKind, EnKeys> = {
  student: "RESIDENT_TYPE_STUDENT",
  employee: "RESIDENT_TYPE_EMPLOYEE",
  job_seeker: "RESIDENT_TYPE_JOB_SEEKER",
  other: "RESIDENT_TYPE_OTHER",
};

export const RESIDENT_SECTION_LABEL: Record<ResidentKind, EnKeys> = {
  student: "RESIDENT_RT_SECTION_STUDENT",
  employee: "RESIDENT_RT_SECTION_EMPLOYEE",
  job_seeker: "RESIDENT_RT_SECTION_JOB_SEEKER",
  other: "RESIDENT_RT_SECTION_OTHER",
};

export const RESIDENT_DETAIL_LABEL: Record<string, EnKeys> = {
  college_name: "RESIDENT_RT_COLLEGE_NAME",
  year_semester: "RESIDENT_RT_YEAR_SEMESTER",
  student_college_id: "RESIDENT_RT_STUDENT_COLLEGE_ID",
  college_location: "RESIDENT_RT_COLLEGE_LOCATION",
  company_name: "RESIDENT_RT_COMPANY_NAME",
  job_role: "RESIDENT_RT_JOB_ROLE",
  work_location: "RESIDENT_RT_WORK_LOCATION",
  employee_id: "RESIDENT_RT_EMPLOYEE_ID",
  shift_timing: "RESIDENT_RT_SHIFT_TIMING",
  related_info: "RESIDENT_RT_RELATED_INFO",
  notes: "RESIDENT_RT_NOTES",
  occupation_description: "RESIDENT_RT_OCCUPATION_DESCRIPTION",
};
