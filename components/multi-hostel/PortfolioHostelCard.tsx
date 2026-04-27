"use client";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { Building2, MapPin, Pencil, Percent, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/AuthStore";
import { t } from "@/lib/i18n";

const HOSTEL_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=720&q=70",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=720&q=70",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=720&q=70",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=720&q=70",
];

export type PortfolioHostelCardData = {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  isActive: boolean;
  rooms: number;
  residents: number;
  occupiedPct: number;
  pendingPayments: number;
  vacatingSoon: number;
};

type PortfolioHostelCardProps = {
  hostel: PortfolioHostelCardData;
  onEdit?: (hostel: PortfolioHostelCardData) => void;
  onDelete?: (hostel: PortfolioHostelCardData) => void;
};

export function PortfolioHostelCard({ hostel, onEdit, onDelete }: PortfolioHostelCardProps) {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const location = [hostel.city, hostel.state].filter(Boolean).join(", ");
  const imageUrl = HOSTEL_CARD_IMAGES[Math.abs(hostel.id) % HOSTEL_CARD_IMAGES.length];
  const occupiedRooms =
    hostel.rooms > 0 ? Math.round((hostel.occupiedPct / 100) * hostel.rooms) : 0;

  const handleViewDetails = () => {
    updateUser({ hostelId: hostel.id });
    router.push("/dashboard");
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", height: 132, flexShrink: 0 }}>
        <Box
          component="img"
          src={imageUrl}
          alt=""
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.35) 0%, transparent 45%)",
          }}
        />
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: "absolute", top: 8, right: 8, alignItems: "center" }}
        >
          {onEdit ? (
            <IconButton
              size="small"
              aria-label="Edit hostel"
              onClick={() => onEdit(hostel)}
              sx={{
                bgcolor: "rgba(255,255,255,0.92)",
                "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                boxShadow: 1,
              }}
            >
              <Pencil className="h-4 w-4 text-slate-700" />
            </IconButton>
          ) : null}
          {onDelete ? (
            <IconButton
              size="small"
              aria-label="Delete hostel"
              color="error"
              onClick={() => onDelete(hostel)}
              sx={{
                bgcolor: "rgba(255,255,255,0.92)",
                "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                boxShadow: 1,
              }}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          ) : null}
          <Chip
            size="small"
            label={hostel.isActive ? t("MULTI_HOSTEL_STATUS_ACTIVE") : t("MULTI_HOSTEL_STATUS_INACTIVE")}
            color={hostel.isActive ? "success" : "default"}
            sx={{ fontWeight: 600, boxShadow: 1 }}
          />
        </Stack>
      </Box>

      <CardContent sx={{ flex: 1, pt: 2, pb: 1.5, px: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3, mb: 0.75 }}>
          {hostel.name}
        </Typography>
        {location ? (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2, color: "text.secondary" }}>
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <Typography variant="body2">{location}</Typography>
          </Stack>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            mb: 1.5,
            textAlign: "center",
          }}
        >
          <Box>
            <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center" sx={{ mb: 0.25 }}>
              <Building2 className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {t("MULTI_HOSTEL_CARD_ROOMS")}
              </Typography>
            </Stack>
            <Typography variant="body1" fontWeight={700}>
              {hostel.rooms}
            </Typography>
          </Box>
          <Box>
            <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center" sx={{ mb: 0.25 }}>
              <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {t("MULTI_HOSTEL_CARD_RESIDENTS")}
              </Typography>
            </Stack>
            <Typography variant="body1" fontWeight={700}>
              {hostel.residents}
            </Typography>
          </Box>
          <Box>
            <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center" sx={{ mb: 0.25 }}>
              <Percent className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {t("MULTI_HOSTEL_CARD_OCCUPIED")}
              </Typography>
            </Stack>
            <Typography variant="body1" fontWeight={700}>
              {occupiedRooms}{" "}
              <Typography component="span" variant="body2" sx={{ color: "success.main", fontWeight: 700 }}>
                ({hostel.occupiedPct}%)
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            px: 0.5,
            py: 1,
            borderRadius: 1,
            bgcolor: "grey.50",
            typography: "body2",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {t("MULTI_HOSTEL_CARD_PENDING")}
            </Typography>
            <Typography fontWeight={700} sx={{ color: "error.main" }}>
              {hostel.pendingPayments}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {t("MULTI_HOSTEL_CARD_VACATING")}
            </Typography>
            <Typography fontWeight={700} sx={{ color: "warning.dark" }}>
              {hostel.vacatingSoon}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, display: "block" }}>
        <Button
          onClick={handleViewDetails}
          fullWidth
          variant="contained"
          disableElevation
          endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
          sx={{
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1.5,
            bgcolor: "var(--primary-400)",
            color: "var(--primary-600)",
            boxShadow: "none",
            "&:hover": { bgcolor: "var(--primary-500)", color: "var(--primary-foreground)", boxShadow: "none" },
          }}
        >
          {t("MULTI_HOSTEL_VIEW_DETAILS")}
        </Button>
      </CardActions>
    </Card>
  );
}
