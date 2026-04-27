"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Add, Apartment, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { t } from "@/lib/i18n";
import { AppButton } from "@/components/ui/button";
import { PortfolioHostelCard, type PortfolioHostelCardData } from "@/components/multi-hostel/PortfolioHostelCard";

const CARD_GAP = 16;
const CARD_MIN_WIDTH = 280;

type HostelPortfolioCarouselProps = {
  hostels: PortfolioHostelCardData[];
  onAddHostel: () => void;
  onEdit: (hostel: PortfolioHostelCardData) => void;
  onDelete: (hostel: PortfolioHostelCardData) => void;
};

export function HostelPortfolioCarousel({ hostels, onAddHostel, onEdit, onDelete }: HostelPortfolioCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 2);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [hostels, updateArrows]);

  const scrollByDirection = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.max(CARD_MIN_WIDTH + CARD_GAP, Math.floor(el.clientWidth * 0.85)) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {t("MULTI_HOSTEL_SECTION_ALL")}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" justifyContent="flex-end">
          <AppButton size="sm" icon={<Add className="size-4" />} onClick={onAddHostel}>
            {t("MULTI_HOSTEL_ADD_HOSTEL")}
          </AppButton>
          <IconButton
            size="small"
            aria-label={t("MULTI_HOSTEL_CAROUSEL_PREV")}
            onClick={() => scrollByDirection(-1)}
            disabled={!canPrev}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            size="small"
            aria-label={t("MULTI_HOSTEL_CAROUSEL_NEXT")}
            onClick={() => scrollByDirection(1)}
            disabled={!canNext}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <ChevronRight />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        ref={scrollerRef}
        sx={{
          display: "flex",
          gap: `${CARD_GAP}px`,
          overflowX: "auto",
          overflowY: "hidden",
          pb: 1,
          mx: { xs: -0.5, sm: 0 },
          px: { xs: 0.5, sm: 0 },
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 4,
            bgcolor: "action.hover",
          },
        }}
      >
        {hostels.length === 0 ? (
          <Box
            sx={{
              flex: "1 1 auto",
              minWidth: "100%",
              scrollSnapAlign: "start",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 3,
              py: 6,
              px: 2,
              textAlign: "center",
              bgcolor: "background.paper",
            }}
          >
            <Apartment sx={{ fontSize: 56, color: "action.disabled", mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("MULTI_HOSTEL_EMPTY_TITLE")}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
              {t("MULTI_HOSTEL_EMPTY_MESSAGE")}
            </Typography>
          </Box>
        ) : (
          hostels.map((h) => (
            <Box
              key={h.id}
              sx={{
                flex: "0 0 auto",
                width: { xs: "min(88vw, 320px)", sm: 300 },
                minWidth: CARD_MIN_WIDTH,
                maxWidth: 320,
                scrollSnapAlign: "start",
              }}
            >
              <PortfolioHostelCard hostel={h} onEdit={onEdit} onDelete={onDelete} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
