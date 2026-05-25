import { Sidebar } from "@/components/panel/Sidebar";

export const metadata = {
  title: "PrintBox Panel",
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-brand-noir text-brand-bone">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-container mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
