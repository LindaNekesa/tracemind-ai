"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onUpdate?: (url: string | null) => void;
}

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-2xl",
  xl: "w-24 h-24 text-3xl",
};

export default function Avatar({ src, name, size = "md", editable = false, onUpdate }: AvatarProps) {
  const [preview, setPreview] = useState<string | null>(src ?? null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setShowMenu(false);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPreview(data.avatar);
      onUpdate?.(data.avatar);
      toast.success("Profile picture updated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
      setPreview(src ?? null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setShowMenu(false);
    try {
      await fetch("/api/profile/avatar", { method: "DELETE" });
      setPreview(null);
      onUpdate?.(null);
      toast.success("Profile picture removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-blue-100 text-blue-700 flex items-center justify-center font-bold select-none`}>
        {uploading ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : preview ? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {editable && (
        <>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-700 transition shadow"
          >
            ✏️
          </button>

          {showMenu && (
            <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 min-w-40">
              <button onClick={() => { setShowMenu(false); inputRef.current?.click(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                📷 {preview ? "Change photo" : "Upload photo"}
              </button>
              {preview && (
                <button onClick={handleRemove}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  🗑️ Remove photo
                </button>
              )}
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
      )}
    </div>
  );
}
