"use client";

import { useQuery } from "@tanstack/react-query";
import { Coffee, Sun, Moon, Pencil, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = days[new Date().getDay()];

const mealConfig = [
  { key: "breakfast" as const, label: "Breakfast", timing: "7:30 AM - 9:00 AM", icon: Coffee, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { key: "lunch" as const, label: "Lunch", timing: "12:00 PM - 2:00 PM", icon: Sun, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { key: "snacks" as const, label: "Snacks", timing: "4:00 PM - 5:00 PM", icon: Moon, iconBg: "bg-slate-100", iconColor: "text-slate-600" },
  { key: "dinner" as const, label: "Dinner", timing: "8:00 PM - 9:30 PM", icon: Moon, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
];

interface MenuItem {
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

export default function FoodMenuPage() {
  const { data: weeklyMenu = [], isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ["food-menu"],
    queryFn: () => fetch("/api/food-menu").then((r) => r.json()),
  });

  if (isLoading) return <div className="p-8">Loading food menu...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load food menu</div>;

  const todayMenu = weeklyMenu.find((m) => m.day === today) || weeklyMenu[0] || { breakfast: "-", lunch: "-", snacks: "-", dinner: "-" };

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
          <CardTitle className="text-xl text-slate-900">
            Today&apos;s Menu — {today}
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">Your meals for today</p>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mealConfig.map(({ key, label, timing, icon: Icon, iconBg, iconColor }) => (
              <div
                key={key}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{label}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {timing}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {todayMenu[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50/50">
          <CardTitle className="text-xl text-slate-900">Weekly Food Menu</CardTitle>
          <p className="text-sm text-slate-500">View and manage the weekly meal schedule</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Day</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-600" />
                      Breakfast
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-orange-600" />
                      Lunch
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-slate-600" />
                      Snacks
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-600" />
                      Dinner
                    </span>
                  </th>
                  <th className="w-16 px-6 py-4 text-left font-semibold text-slate-900">Edit</th>
                </tr>
              </thead>
              <tbody>
                {weeklyMenu.map((menu) => (
                  <tr
                    key={menu.day}
                    className={`border-b border-slate-200 transition-colors last:border-0 ${
                      menu.day === today
                        ? "bg-primary/5"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{menu.day}</span>
                        {menu.day === today && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20">
                            Today
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{menu.breakfast}</td>
                    <td className="px-6 py-4 text-slate-700">{menu.lunch}</td>
                    <td className="px-6 py-4 text-slate-700">{menu.snacks}</td>
                    <td className="px-6 py-4 text-slate-700">{menu.dinner}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                        aria-label={`Edit ${menu.day} menu`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
