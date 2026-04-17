
const ADVANCED_PLAN_IDS = new Set(["pro", "enterprise"]);

export function planHasAdvancedFeatures(planId: string | null | undefined): boolean {
  if (!planId) return false;
  return ADVANCED_PLAN_IDS.has(planId);
}
