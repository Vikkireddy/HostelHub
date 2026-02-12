"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer as PieResponsive } from "recharts";
import { Users, Building2, Receipt, ClipboardList, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusChip } from "@/components/ui/status-chip";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface DashboardStats {
  students: Array<{ id: string | number; name: string; room: string; course: string; joinDate: string; phone: string }>;
  payments: Array<{ id: string | number; student: string; month: string; amount: number; status: string }>;
  complaints: Array<{ id: string | number; description: string; status: string; student_name?: string; room_number?: string }>;
  revenue: Array<{ month: string; revenue: number }>;
  roomDistribution: Array<{ name: string; value: number; color: string }>;
  stats: { totalStudents: number; availableRooms: number; occupiedRooms: number; maintenanceRooms: number; pendingBills: number; pendingBillsAmount: number; openComplaints: number };
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (error || !data) return <div className="p-8 text-red-600">Failed to load dashboard</div>;

  const { students, payments, complaints, revenue, roomDistribution, stats } = data;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Welcome back, Admin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />+2 this month
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.availableRooms}</p>
              <p className="text-sm text-slate-500">Available Rooms</p>
              <p className="text-xs text-red-600">{stats.occupiedRooms} occupied</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingBills}</p>
              <p className="text-sm text-slate-500">Pending Bills</p>
              <p className="flex items-center gap-1 text-xs text-red-600">
                <ArrowDownRight className="h-3 w-3" />₹{stats.pendingBillsAmount.toLocaleString()} Due Amount
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Receipt className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.openComplaints}</p>
              <p className="text-sm text-slate-500">Open Complaints</p>
              <p className="text-xs text-red-600">{stats.openComplaints === 0 ? "All clear" : "Need attention"}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <ClipboardList className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Room Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <PieResponsive width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {roomDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </PieResponsive>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-slate-900">Recent Payments</CardTitle>
            <Link href="/dashboard/payments" className="text-sm text-[#3b82f6] hover:underline">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">
                          {payment.student.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{payment.student}</p>
                        <p className="text-xs text-slate-500">{payment.month}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                      <StatusChip status={payment.status as "paid" | "pending" | "overdue"} />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-slate-900">Recent Complaints</CardTitle>
            <Link href="/dashboard/complaints" className="text-sm text-[#3b82f6] hover:underline">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-4">
                {complaints.map((complaint) => {
                  const room = complaint.room_number || "";
                  const person = complaint.student_name || "";
                  const parts = complaint.description.split(" Room ");
                  const title = parts[0] || complaint.description;
                  return (
                    <div key={complaint.id} className="flex items-start gap-3">
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          complaint.status === "resolved"
                            ? "bg-green-500"
                            : complaint.status === "in-progress"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{title}</p>
                        {(room || person) && (
                          <p className="text-xs text-slate-500">
                            {room ? `Room ${room}` : ""}
                            {room && person ? " - " : ""}
                            {person}
                          </p>
                        )}
                      </div>
                      <StatusChip status={complaint.status as "open" | "in-progress" | "resolved"} />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900">Students Overview</CardTitle>
          <Link href="/dashboard/students" className="text-sm text-[#3b82f6] hover:underline">
            Manage →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Room</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Course</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Join Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-200 transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{student.room}</td>
                    <td className="px-6 py-4 text-slate-700">{student.course}</td>
                    <td className="px-6 py-4 text-slate-700">{student.joinDate}</td>
                    <td className="px-6 py-4 text-slate-700">{student.phone}</td>
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
