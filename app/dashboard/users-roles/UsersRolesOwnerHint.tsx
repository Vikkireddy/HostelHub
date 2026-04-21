import { Lock } from "lucide-react";
import { t } from "@/lib/i18n";

export function UsersRolesOwnerHint() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
      <Lock className="h-3.5 w-3.5" />
      {t("USERS_ROLES_OWNER_ONLY_HINT")}
    </span>
  );
}
