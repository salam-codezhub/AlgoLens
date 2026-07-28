import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactElement } from "react";
import { cn } from "../lib/utils.js";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>): ReactElement {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60",
        className
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>): ReactElement {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "bg-card text-card-foreground border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="text-muted-foreground hover:text-foreground absolute top-4 right-4">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)} {...props} />
  );
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>): ReactElement {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>): ReactElement {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
