import Sidebar from '@/components/ui/Sidebar';
import BottomNav from '@/components/ui/BottomNav';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#080C14]">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 pb-20 md:pb-0">
        {children}
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
