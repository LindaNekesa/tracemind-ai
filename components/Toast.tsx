"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
}

export default function Toast({ message, type = "success", duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}
