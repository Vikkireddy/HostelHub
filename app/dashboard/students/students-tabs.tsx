"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "@/components/ui/box";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Users } from "lucide-react";
import { t } from "@/lib/i18n";
import { useSearchStore } from "@/lib/search-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentsMuiTable } from "./students-mui-table";
import { getStudentColumns, getInactiveStudentColumns, type Student, type InactiveStudent } from "./columns";

interface Room {
  id: number;
  number: string;
  floor: number;
  type: string;
  rent?: number;
}

interface StudentsTabsProps {
  students: Student[];
  filteredStudents: Student[];
  inactiveStudents: InactiveStudent[];
  filteredInactive: InactiveStudent[];
  inactiveLoading: boolean;
  rooms: Room[];
  filterRoom: string;
  filterPaymentStatus: string;
  onFilterRoomChange: (value: string) => void;
  onFilterPaymentStatusChange: (value: string) => void;
  onCheckOut: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  canDeleteStudent: (student: Student) => boolean;
}

export function StudentsTabs({
  students,
  filteredStudents,
  inactiveStudents,
  filteredInactive,
  inactiveLoading,
  rooms,
  filterRoom,
  filterPaymentStatus,
  onFilterRoomChange,
  onFilterPaymentStatusChange,
  onCheckOut,
  onEdit,
  onDelete,
  canDeleteStudent,
}: StudentsTabsProps) {
  const { query, setQuery } = useSearchStore();
  const columns = getStudentColumns(onCheckOut, onEdit, onDelete, canDeleteStudent);
  const inactiveColumns = getInactiveStudentColumns();

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <Tabs defaultValue="present" className="w-full">
          <Box className="flex flex-wrap items-center gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
            <TabsList className="h-9 rounded-lg bg-slate-100 p-1 shrink-0">
              <TabsTrigger value="present" className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t("PRESENT")} ({filteredStudents.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t("INACTIVE")} ({filteredInactive.length})
              </TabsTrigger>
            </TabsList>
            <Box className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("SEARCH_STUDENTS_PLACEHOLDER")}
                className="h-9 rounded-lg border-slate-200 bg-white pl-9 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Box>
            <Select value={filterRoom} onValueChange={onFilterRoomChange}>
              <SelectTrigger className="h-9 w-[140px] rounded-lg border-slate-200 bg-white">
                <SelectValue placeholder={t("ALL_ROOMS")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ALL_ROOMS")}</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.number} {r.type && `(${r.type})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPaymentStatus} onValueChange={onFilterPaymentStatusChange}>
              <SelectTrigger className="h-9 w-[140px] rounded-lg border-slate-200 bg-white">
                <SelectValue placeholder={t("ALL_STATUS")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ALL_STATUS")}</SelectItem>
                <SelectItem value="No Due Amount">No Due Amount</SelectItem>
                <SelectItem value="Pending">{t("PENDING")}</SelectItem>
                <SelectItem value="Overdue">{t("OVERDUE")}</SelectItem>
              </SelectContent>
            </Select>
          </Box>
          <TabsContent value="present" className="mt-0 p-6 pt-4">
            {students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students found"
                message="Add students using the Add Student button above"
                className="min-h-[250px]"
              />
            ) : (
              <StudentsMuiTable
                columns={columns}
                data={filteredStudents}
                getRowId={(row: Student) => row.id}
              />
            )}
          </TabsContent>
          <TabsContent value="inactive" className="mt-0 p-6 pt-4">
            {inactiveLoading ? (
              <Box className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Box key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </Box>
                ))}
              </Box>
            ) : inactiveStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t("NO_INACTIVE_STUDENTS")}
                message={t("INACTIVE_STUDENTS_EMPTY_MESSAGE")}
                className="min-h-[250px]"
              />
            ) : (
              <StudentsMuiTable
                columns={inactiveColumns}
                data={filteredInactive}
                getRowId={(row: InactiveStudent) => row.id}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
