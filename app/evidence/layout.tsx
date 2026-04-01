import Sidebar from "@/components/SideBar";
import Navbar from "@/components/NavBar";

export default function EvidenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  );
}
