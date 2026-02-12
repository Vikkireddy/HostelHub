"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface Payment {
  id: string | number;
  student_name: string;
  month: string;
  year: number;
  amount: number;
  status: string;
}

interface Student {
  id: string | number;
  name: string;
}

const getDefaultMonthYear = () => {
  const d = new Date();
  return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
};

const initialForm = {
  student_id: "",
  amount: "",
  month: getDefaultMonthYear().month,
  year: getDefaultMonthYear().year,
  status: "paid" as "paid" | "pending" | "overdue",
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const { data: payments = [], isLoading, error } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: () => fetch("/api/payments").then((r) => r.json()),
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => fetch("/api/students").then((r) => r.json()),
  });

  const recordPayment = useMutation({
    mutationFn: async (data: typeof initialForm) => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: Number(data.student_id),
          amount: Number(data.amount),
          month: data.month,
          year: Number(data.year),
          status: data.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record payment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setForm({ ...initialForm, month: getDefaultMonthYear().month, year: getDefaultMonthYear().year });
      setModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.amount || !form.month || !form.year) return;
    recordPayment.mutate(form);
  };

  if (isLoading) return <div className="p-8">Loading payments...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load payments</div>;

  const monthLabel = (p: Payment) => `${p.month} ${p.year}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Records</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a rent payment for a student. Select student, amount, and billing period.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {recordPayment.isError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {recordPayment.error?.message}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Select
                value={form.student_id || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, student_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select student</SelectItem>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Select
                value={form.month}
                onValueChange={(v) => setForm((f) => ({ ...f, month: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="e.g. 2025"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as "paid" | "pending" | "overdue" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Saving..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {(payment.student_name || "").split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{payment.student_name}</p>
                    <p className="text-sm text-slate-500">{monthLabel(payment)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">₹{Number(payment.amount).toLocaleString()}</span>
                  <StatusChip status={payment.status as "paid" | "pending" | "overdue"} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
