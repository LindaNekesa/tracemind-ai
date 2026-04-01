"use client";

import { useEffect, useState } from "react";
import PhonePrompt from "./PhonePrompt";

const DISMISSED_KEY = "phone_prompt_dismissed";

export default function PhoneCheck() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((user) => {
        if (user && !user.phone) setShowPrompt(true);
      })
      .catch(() => {});
  }, []);

  const handleDone = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;
  return <PhonePrompt onDone={handleDone} />;
}
