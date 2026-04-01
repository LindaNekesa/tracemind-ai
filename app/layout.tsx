import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "TraceMind AI",
  description: "Digital Forensics Investigation Assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
