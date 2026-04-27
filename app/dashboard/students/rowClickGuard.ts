/** After a row action Menu closes, the same click can hit the row underneath (ghost click). */
let rowClickSuppressedUntil = 0;

export function suppressStudentTableRowClick(ms = 500): void {
  rowClickSuppressedUntil = Date.now() + ms;
}

export function isStudentTableRowClickSuppressed(): boolean {
  return Date.now() < rowClickSuppressedUntil;
}
