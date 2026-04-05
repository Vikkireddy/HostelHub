/**
 * Route handlers that read `request.headers` (or cookies) must opt out of static
 * generation so Next.js does not try to execute them at build time.
 */
export const dynamic = "force-dynamic";
