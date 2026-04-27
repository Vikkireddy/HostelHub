"use client";

import * as React from "react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MODAL_WIDTH_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[calc(100vw-2rem)] w-full",
} as const;

export type ModalWidth = keyof typeof MODAL_WIDTH_CLASS;

export type ModalStyleConfig = {
  /** When true, body area has no horizontal padding (header/footer padding unchanged). */
  removeModalBodyPadding?: boolean;
};

export type ModalWithHeaderFooterProps = {
  /** Optional trigger rendered inside `Dialog` before content (e.g. `DialogTrigger`). */
  trigger?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown in the header row when not using `enableCustomHeader` / `hideHeader`. */
  headerTitle?: ReactNode;
  /** Optional description under the title (same header block). */
  headerDescription?: ReactNode;
  /** Optional element on the header row (e.g. actions), before the close control. */
  headerRight?: ReactNode;
  /** Main content (scrollable). Omit when the modal is header + footer only. */
  children?: ReactNode;
  /** Footer actions; the footer strip is omitted when empty. */
  footerComponent?: ReactNode;
  /** When false, outside click does not close (default). */
  isBackdropCloseEnabled?: boolean;
  /** Radix close (X); default true. */
  enableClose?: boolean;
  /** When true, modal appears as a right-side shutter (drawer-style panel). */
  isShutterEnabled?: boolean;
  /** Hide the header row; set `srOnlyTitle` (or a string `headerTitle`) so a title exists for assistive tech. */
  hideHeader?: boolean;
  /** Replace the default title/description header with custom content (place a visible title inside, or set `srOnlyTitle`). */
  enableCustomHeader?: boolean;
  customHeader?: ReactNode;
  /** Screen-reader title when the visible header is hidden/custom and no string `headerTitle` is used. */
  srOnlyTitle?: string;
  maxWidth?: ModalWidth;
  /** Applied as `style.maxWidth` when set (number → px). */
  width?: number | string;
  className?: string;
  /** Merged into the scrollable body wrapper (e.g. `overflow-hidden` when the child manages its own scroll). */
  bodyClassName?: string;
  /** Merged into the footer row (e.g. column layout for stacked actions). */
  footerClassName?: string;
  styleConfig?: ModalStyleConfig;
  "data-testid"?: string;
};

/** @deprecated Use `ModalWithHeaderFooterProps` */
export type ModalProps = ModalWithHeaderFooterProps;

function hasFooterContent(footer: ReactNode): boolean {
  if (footer == null || footer === false) return false;
  return React.Children.toArray(footer).some((child) => {
    if (child == null || typeof child === "boolean") return false;
    if (typeof child === "string") return child.trim().length > 0;
    return true;
  });
}

function fallbackSrTitle(
  headerTitle: ReactNode | undefined,
  srOnlyTitle: string | undefined
): string {
  if (typeof headerTitle === "string" && headerTitle.trim()) return headerTitle;
  if (srOnlyTitle?.trim()) return srOnlyTitle;
  return "Dialog";
}

export function ModalWithHeaderFooter({
  trigger,
  open,
  onOpenChange,
  headerTitle,
  headerDescription,
  headerRight,
  children,
  footerComponent,
  isBackdropCloseEnabled = false,
  enableClose = true,
  isShutterEnabled = false,
  hideHeader = false,
  enableCustomHeader = false,
  customHeader,
  srOnlyTitle,
  maxWidth = "lg",
  width,
  className,
  bodyClassName,
  footerClassName,
  styleConfig = {},
  "data-testid": testId,
}: ModalWithHeaderFooterProps) {
  const { removeModalBodyPadding = false } = styleConfig;
  const showFooter = hasFooterContent(footerComponent);
  const widthStyle =
    width !== undefined
      ? { maxWidth: typeof width === "number" ? `${width}px` : width } satisfies React.CSSProperties
      : undefined;

  const showDefaultHeader = !hideHeader && !enableCustomHeader && headerTitle != null && headerTitle !== false;

  const showSrOnlyTitle =
    hideHeader || Boolean(enableCustomHeader && srOnlyTitle?.trim());

  const srOnlyText = hideHeader
    ? fallbackSrTitle(headerTitle, srOnlyTitle)
    : (srOnlyTitle ?? "").trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent
        data-testid={testId}
        showClose={enableClose}
        closeOnInteractOutside={isBackdropCloseEnabled}
        className={cn(
          "flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0",
          isShutterEnabled &&
            "left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] translate-x-0 translate-y-0 rounded-none data-[state=closed]:slide-out-to-right data-[state=closed]:slide-out-to-top-[0%] data-[state=open]:slide-in-from-right data-[state=open]:slide-in-from-top-[0%]",
          MODAL_WIDTH_CLASS[maxWidth],
          className
        )}
        style={widthStyle}
      >
        {showSrOnlyTitle ? <DialogTitle className="sr-only">{srOnlyText}</DialogTitle> : null}

        {showDefaultHeader ? (
          <div
            className={cn(
              "flex shrink-0 flex-col gap-0 border-b px-6 pb-4 pt-6",
              enableClose && "pr-12"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <DialogHeader className="min-w-0 flex-1 space-y-2 p-0 text-left sm:text-left">
                <DialogTitle className="text-left">{headerTitle}</DialogTitle>
                {headerDescription != null && headerDescription !== false ? (
                  <DialogDescription className="text-left">{headerDescription}</DialogDescription>
                ) : null}
              </DialogHeader>
              {headerRight ? <div className="flex shrink-0 items-center gap-2">{headerRight}</div> : null}
            </div>
          </div>
        ) : null}

        {!hideHeader && enableCustomHeader ? (
          <div
            className={cn(
              "flex shrink-0 items-start justify-between gap-3 border-b px-6 pb-4 pt-6",
              enableClose && "pr-12"
            )}
          >
            <div className="min-w-0 flex-1">{customHeader}</div>
            {headerRight ? <div className="flex shrink-0 items-center gap-2">{headerRight}</div> : null}
          </div>
        ) : null}

        {children != null && children !== false ? (
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto",
              removeModalBodyPadding ? "px-0 py-4" : "px-6 py-4",
              bodyClassName
            )}
          >
            {children}
          </div>
        ) : null}

        {showFooter ? (
          <DialogFooter
            className={cn(
              "shrink-0 border-t px-6 py-4 sm:flex-row sm:justify-end sm:space-x-2",
              footerClassName
            )}
          >
            {footerComponent}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
