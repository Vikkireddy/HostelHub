export const PLATFORM_SESSION_COOKIE = "hh_platform_session";

export function getPlatformStatsSecret(): string | null {
  return process.env.PLATFORM_STATS_SECRET?.trim() || null;
}
