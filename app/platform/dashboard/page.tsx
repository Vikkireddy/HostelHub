"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Building2, DoorOpen, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";

type HostelRow = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: string;
  adminEmail: string | null;
  adminName: string | null;
};

type StatsPayload = {
  summary: {
    totalHostels: number;
    adminsWithHostel: number;
    totalStudents: number;
    totalRooms: number;
    hostelsThisMonth: number;
  };
  subscriptionByStatus: Record<string, number>;
  hostels: HostelRow[];
  note?: string;
};

type SummaryKey = keyof StatsPayload["summary"];

const PLATFORM_SUMMARY_CARDS: {
  metricKey: SummaryKey;
  label: string;
  iconClass: string;
  Icon: LucideIcon;
}[] = [
  { metricKey: "totalHostels", label: "Total hostels", iconClass: "text-sky-400", Icon: Building2 },
  { metricKey: "totalStudents", label: "Students (all)", iconClass: "text-emerald-400", Icon: Users },
  { metricKey: "totalRooms", label: "Rooms (all)", iconClass: "text-violet-400", Icon: DoorOpen },
  { metricKey: "adminsWithHostel", label: "Admins linked", iconClass: "text-amber-400", Icon: Users },
  {
    metricKey: "hostelsThisMonth",
    label: "New hostels (this month)",
    iconClass: "text-cyan-400",
    Icon: Building2,
  },
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PlatformDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/platform/stats", { credentials: "include" });
    if (res.status === 401) {
      setLoading(false);
      router.replace("/platform/login");
      return;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json?.error === "string" ? json.error : "Could not load stats.");
      setLoading(false);
      return;
    }
    setData(json as StatsPayload);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    await fetch("/api/platform/logout", { method: "POST", credentials: "include" });
    router.replace("/platform/login");
    router.refresh();
  };

  if (loading && !data) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading platform data…
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
        <Typography className="text-red-300">{error}</Typography>
        <Button
          variant="outline"
          onClick={() => load()}
          className="border-slate-500 bg-slate-900/90 text-slate-100 hover:bg-slate-800 hover:text-white"
        >
          Retry
        </Button>
        <Link href="/platform/login" className="text-sm text-sky-400 underline">
          Sign in again
        </Link>
      </Box>
    );
  }

  const s = data!.summary;
  const sub = data!.subscriptionByStatus;

  return (
    <Box className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
      <Box className="mx-auto max-w-6xl">
        <Box className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <h1 className="text-2xl font-bold tracking-tight text-white">Platform overview</h1>
            <Typography className="text-sm text-slate-400">
              All hostels and cross-tenant totals (super admin only)
            </Typography>
          </Box>
          <Box className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-500 bg-slate-900/90 text-slate-100 hover:bg-slate-800 hover:text-white [&_svg]:text-slate-100"
              asChild
            >
              <Link href="/">Home</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-500 bg-slate-900/90 text-slate-100 hover:bg-slate-800 hover:text-white [&_svg]:text-slate-100"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </Box>
        </Box>

        <Box className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PLATFORM_SUMMARY_CARDS.map(({ metricKey, label, iconClass, Icon }) => (
            <StatCard
              key={metricKey}
              icon={<Icon className={`h-5 w-5 ${iconClass}`} />}
              label={label}
              value={s[metricKey]}
            />
          ))}
        </Box>

        {Object.keys(sub).length > 0 && (
          <Box className="mb-8 rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <Typography className="mb-2 text-sm font-semibold text-slate-200">
              Subscriptions by status
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {Object.entries(sub).map(([status, count]) => (
                <span
                  key={status}
                  className="rounded-md border border-slate-600 bg-slate-950/80 px-2.5 py-1 text-xs text-slate-300"
                >
                  {status}: <strong className="text-white">{count}</strong>
                </span>
              ))}
            </Box>
          </Box>
        )}

        {data?.note && (
          <Typography variant="caption" className="mb-4 block text-slate-500">
            {data.note}
          </Typography>
        )}

        <Box className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/60 shadow-lg shadow-black/20">
          <Box className="border-b border-slate-700/80 px-4 py-3">
            <Typography className="font-semibold text-slate-100">Hostels</Typography>
            <Typography variant="caption" className="text-slate-500">
              Up to 300 most recent by id
            </Typography>
          </Box>
          <Box className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/80 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Hostel</th>
                  <th className="px-4 py-3 font-medium">Primary admin</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {data!.hostels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No hostels found.
                    </td>
                  </tr>
                ) : (
                  data!.hostels.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-slate-800/80 transition-colors hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">{h.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-100">{h.name}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <div>{h.adminName || "—"}</div>
                        <div className="text-xs text-slate-500">{h.adminEmail || "—"}</div>
                      </td>
                      <td className="max-w-[200px] px-4 py-3 text-slate-400">
                        {[h.city, h.state].filter(Boolean).join(", ") || "—"}
                        {h.pincode ? ` ${h.pincode}` : ""}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                        {formatDate(h.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Box className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4 shadow-sm shadow-black/10">
      <Box className="mb-2 flex items-center gap-2">{icon}</Box>
      <Typography className="text-2xl font-bold tabular-nums text-white">{value}</Typography>
      <Typography variant="caption" className="text-slate-500">
        {label}
      </Typography>
    </Box>
  );
}
