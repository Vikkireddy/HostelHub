export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { runMigrations } = await import("./lib/migrate");
      await runMigrations();
    } catch {
    }
  }
}
