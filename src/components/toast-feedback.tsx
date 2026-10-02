"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ToastFeedback({
  message,
  kind = "error",
}: {
  message?: string | string[];
  kind?: "success" | "error";
}) {
  const lastMessage = useRef("");
  const displayMessage = Array.isArray(message) ? message[0] : message;

  useEffect(() => {
    if (!displayMessage || lastMessage.current === displayMessage) return;
    lastMessage.current = displayMessage;
    if (kind === "success") toast.success(displayMessage);
    else toast.error(displayMessage);
  }, [kind, displayMessage]);

  return null;
}