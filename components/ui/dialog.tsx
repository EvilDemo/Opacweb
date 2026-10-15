"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { useDialogFocusReturn } from "@/hooks/useDialogFocusReturn";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  const focusReturn = useDialogFocusReturn();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95" />
      <DialogPrimitive.Content
        className={cn("fixed inset-0 z-50", className)}
        {...focusReturn}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}
