import { en } from "./en";

export type { EnKeys } from "./en";

export const t = (key: keyof typeof en, params?: Record<string, string | number>): string => {
  let value: string = en[key];
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }
  return value;
};

export { en };
