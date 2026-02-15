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

export const getDefaultMonthYear = () => {
  const d = new Date();
  return {
    month: MONTHS[d.getMonth()],
    year: String(d.getFullYear()),
  };
};
