import { LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, message, className = "h-[250px]" }: EmptyStateProps) {
  return (
    <Box className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Box className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" />
      </Box>
      <Typography className="text-sm font-medium text-slate-600">{title}</Typography>
      <Typography variant="caption" className="text-slate-500">
        {message}
      </Typography>
    </Box>
  );
}
