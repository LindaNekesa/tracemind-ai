"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      console.log("Verifying token:", token);
      // call your API here
    }
  }, [token]);

  return <div>Verifying your email...</div>;
}