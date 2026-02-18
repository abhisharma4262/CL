import { Bell, User } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isDetail = location.pathname.startsWith("/application/");

  return (
    <header
      data-testid="header"
      className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-40"
    >
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-[#1a3a2a] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
          <span className="text-[#55C9A6] text-sm font-semibold italic mr-1">/\/\</span>
          <span className="text-xs font-medium text-gray-400 mr-1">myridius</span>
          <span className="text-lg font-extrabold tracking-[0.15em]">EVOQ</span>
        </span>
      </div>

      <h1
        data-testid="header-title"
        className="text-base font-bold text-[#1a3a2a] tracking-tight absolute left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Underwriter Workbench
      </h1>

      <div className="flex items-center gap-4">
        <button data-testid="header-notifications" className="relative p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={14} className="text-gray-500" />
          </div>
          <div className="text-right">
            <p data-testid="header-user-name" className="text-xs font-semibold text-gray-800 leading-tight">Jane Doe</p>
            <p className="text-[10px] text-gray-400 leading-tight">Underwriter</p>
          </div>
        </div>
      </div>
    </header>
  );
}
