export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_FIELD_DESC_SQL =
  "FIELD(p.month, 'January','February','March','April','May','June','July','August','September','October','November','December') DESC";

export const MONTH_FIELD_ASC_SQL =
  "FIELD(month, 'January','February','March','April','May','June','July','August','September','October','November','December') ASC";
