"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronDown, X } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
} from "react";

function classes(...values: (string | undefined | false)[]) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "icon";
}) {
  return (
    <button
      type={type}
      className={classes(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c8060] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-[#1e3829] text-white hover:bg-[#315b40]",
        variant === "outline" && "border border-[#d9e0dc] bg-white text-[#29332b] hover:bg-[#f3f6f3]",
        variant === "ghost" && "text-[#39443b] hover:bg-[#f1f4f1]",
        variant === "destructive" && "bg-[#a34334] text-white hover:bg-[#87382c]",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 rounded-md px-3",
        size === "icon" && "size-9 p-0",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("rounded-lg border border-[#e0e6e2] bg-white text-[#202820] shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={classes("text-sm font-semibold leading-none", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={classes("text-sm text-[#68766e]", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("p-5 pt-0", className)} {...props} />;
}

export function Badge({
  className,
  variant = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: "muted" | "success" | "warning" | "danger" | "info" | "draft" | "published" | "reserved" | "soldOut";
}) {
  return (
    <span
      className={classes(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "muted" && "border-[#dfe5e1] bg-[#f3f6f4] text-[#536159]",
        variant === "success" && "border-[#b9d8c1] bg-[#edf7ef] text-[#2d6940]",
        variant === "warning" && "border-[#efd4a4] bg-[#fff7e8] text-[#895c16]",
        variant === "danger" && "border-[#ecc4bd] bg-[#fff2ef] text-[#9a4032]",
        variant === "info" && "border-[#c4dbe5] bg-[#eef7fa] text-[#326477]",
        variant === "draft" && "border-[#dfe5e1] bg-[#f3f6f4] text-[#536159]",
        variant === "published" && "border-[#b9d8c1] bg-[#edf7ef] text-[#2d6940]",
        variant === "reserved" && "border-[#efd4a4] bg-[#fff7e8] text-[#895c16]",
        variant === "soldOut" && "border-[#ecc4bd] bg-[#fff2ef] text-[#9a4032]",
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={classes(
        "flex h-10 w-full rounded-md border border-[#d9e0dc] bg-white px-3 py-2 text-sm text-[#29332b] placeholder:text-[#8b968f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c8060] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={classes("text-sm font-medium text-[#344138]", className)} {...props} />;
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("animate-pulse rounded-md bg-[#e9eeeb]", className)} {...props} />;
}

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(function Table(
  { className, ...props },
  ref,
) {
  return (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={classes("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
});

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHeader(
  { className, ...props },
  ref,
) {
  return <thead ref={ref} className={classes("[&_tr]:border-b [&_tr]:border-[#e8ede9]", className)} {...props} />;
});

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody(
  { className, ...props },
  ref,
) {
  return <tbody ref={ref} className={classes("[&_tr:last-child]:border-0", className)} {...props} />;
});

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function TableRow(
  { className, ...props },
  ref,
) {
  return <tr ref={ref} className={classes("border-b border-[#e8ede9] transition-colors hover:bg-[#f8faf8]", className)} {...props} />;
});

export const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(function TableHead(
  { className, ...props },
  ref,
) {
  return <th ref={ref} className={classes("h-11 px-3 text-left align-middle text-xs font-semibold text-[#65736a]", className)} {...props} />;
});

export const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(function TableCell(
  { className, ...props },
  ref,
) {
  return <td ref={ref} className={classes("p-3 align-middle", className)} {...props} />;
});

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = AccordionPrimitive.Item;
export const AccordionContent = AccordionPrimitive.Content;

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  AccordionPrimitive.AccordionTriggerProps
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={classes(
          "flex flex-1 items-center justify-between py-4 text-left text-sm font-semibold text-[#29332b] transition hover:text-[#1e3829] [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-[#68766e] transition-transform duration-200" aria-hidden="true" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuItemProps
>(function DropdownMenuItem({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={classes(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-[#f1f5f2] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuContentProps
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={classes(
          "z-50 min-w-40 overflow-hidden rounded-md border border-[#dfe5e1] bg-white p-1 text-[#29332b] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps
>(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#15231a]/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        ref={ref}
        className={classes(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-[#dfe5e1] bg-white p-6 shadow-xl",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm p-1 text-[#68766e] opacity-75 transition hover:bg-[#f1f5f2] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c8060]">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("flex flex-col gap-2 text-left", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export const DialogTitleText = forwardRef<
  HTMLHeadingElement,
  DialogPrimitive.DialogTitleProps
>(function DialogTitleText({ className, ...props }, ref) {
  return <DialogTitle ref={ref} className={classes("text-lg font-semibold text-[#202820]", className)} {...props} />;
});

export const DialogDescriptionText = forwardRef<
  HTMLParagraphElement,
  DialogPrimitive.DialogDescriptionProps
>(function DialogDescriptionText({ className, ...props }, ref) {
  return <DialogDescription ref={ref} className={classes("text-sm leading-6 text-[#68766e]", className)} {...props} />;
});