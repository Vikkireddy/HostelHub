export const STATUS_CHIP_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgb(254 243 199)", color: "rgb(180 83 9)" },
  overdue: { bg: "rgb(254 226 226)", color: "rgb(185 28 28)" },
  paid: { bg: "rgb(209 250 229)", color: "rgb(22 101 52)" },
};

export const HEADER_CELL_SX = {
  fontWeight: 600,
  color: "rgb(15 23 42)",
  backgroundColor: "rgb(248 250 252)",
  borderBottom: "1px solid rgb(226 232 240)",
};

export const TABLE_COLUMNS = ["Name", "Period", "Due Info", "Amount", "Status", "History", "Actions"] as const;
