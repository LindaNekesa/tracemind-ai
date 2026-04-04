import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "TraceMind AI — Digital Forensics Platform",
  description: "AI-powered digital forensics investigation platform. Manage evidence, detect threats, verify cases for court.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Apply dark mode before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('theme');if(m==='dark'||(!m&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-gray-100 text-gray-800 transition-colors duration-200">
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
