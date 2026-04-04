"use client";

import { useState } from "react";

const COUNTRIES = [
  { code: "+1",   flag: "🇺🇸", name: "US" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+254", flag: "🇰🇪", name: "KE" },
  { code: "+27",  flag: "🇿🇦", name: "ZA" },
  { code: "+234", flag: "🇳🇬", name: "NG" },
  { code: "+233", flag: "🇬🇭", name: "GH" },
  { code: "+255", flag: "🇹🇿", name: "TZ" },
  { code: "+256", flag: "🇺🇬", name: "UG" },
  { code: "+251", flag: "🇪🇹", name: "ET" },
  { code: "+20",  flag: "🇪🇬", name: "EG" },
  { code: "+212", flag: "🇲🇦", name: "MA" },
  { code: "+49",  flag: "🇩🇪", name: "DE" },
  { code: "+33",  flag: "🇫🇷", name: "FR" },
  { code: "+91",  flag: "🇮🇳", name: "IN" },
  { code: "+86",  flag: "🇨🇳", name: "CN" },
  { code: "+61",  flag: "🇦🇺", name: "AU" },
  { code: "+55",  flag: "🇧🇷", name: "BR" },
  { code: "+52",  flag: "🇲🇽", name: "MX" },
  { code: "+971", flag: "🇦🇪", name: "AE" },
  { code: "+966", flag: "🇸🇦", name: "SA" },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function PhoneInput({ value, onChange, placeholder = "712 345 678", className = "", required }: Props) {
  const [dialCode, setDialCode] = useState("+254");

  // Parse existing value to extract dial code
  const localNumber = value.startsWith(dialCode) ? value.slice(dialCode.length).trim() : value.replace(/^\+\d{1,4}\s?/, "");

  const handleNumberChange = (num: string) => {
    const digits = num.replace(/[^\d\s]/g, "");
    onChange(digits ? `${dialCode} ${digits}` : "");
  };

  const handleDialChange = (code: string) => {
    setDialCode(code);
    const digits = localNumber.replace(/[^\d\s]/g, "");
    onChange(digits ? `${code} ${digits}` : "");
  };

  const inputBase = "bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className={`flex gap-0 ${className}`}>
      <select
        value={dialCode}
        onChange={(e) => handleDialChange(e.target.value)}
        className={`${inputBase} px-2 py-3 rounded-l-xl border-r-0 shrink-0 w-24 cursor-pointer`}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code} className="bg-gray-900">
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        placeholder={placeholder}
        value={localNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        required={required}
        className={`${inputBase} flex-1 px-4 py-3 rounded-r-xl`}
      />
    </div>
  );
}
