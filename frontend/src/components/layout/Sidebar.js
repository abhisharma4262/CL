import { useLocation, Link } from "react-router-dom";
import {
  ClipboardList,
  MonitorCheck,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: ClipboardList, label: "Workbench", path: "/" },
  { icon: MonitorCheck, label: "AI Review", path: "/ai-review" },
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: User, label: "Account", path: "/account" },
  { icon: LogOut, label: "Log Out", path: "/logout" },
];

export default function Sidebar() {
  const location = useLocation();

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        data-testid={`sidebar-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all duration-200 group relative
          ${isActive
            ? "bg-[#1a3a2a] text-white"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#55C9A6] rounded-r" />
        )}
        <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
        <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      data-testid="sidebar"
      className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0"
      style={{ minHeight: "100vh" }}
    >
      <button data-testid="sidebar-menu-toggle" className="mb-6 p-1.5 text-gray-500 hover:text-gray-700">
        <Menu size={20} />
      </button>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      <div className="border-t border-gray-200 w-10 my-3" />

      <nav className="flex flex-col gap-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
}
