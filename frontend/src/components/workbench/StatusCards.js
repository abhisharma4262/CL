import { MessageCircle, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const CARD_CONFIG = [
  {
    key: "pending",
    label: "Pending",
    sublabel: "Underwriter review",
    icon: MessageCircle,
    iconBg: "bg-[#1a3a2a]",
    iconColor: "text-white",
  },
  {
    key: "awaiting",
    label: "Awaiting",
    sublabel: "Instructions for AI Agent",
    icon: Clock,
    iconBg: "bg-[#1a3a2a]",
    iconColor: "text-white",
  },
  {
    key: "completed",
    label: "Completed",
    sublabel: "Applications approved & rejected",
    icon: CheckCircle2,
    iconBg: "bg-[#1a3a2a]",
    iconColor: "text-white",
  },
];

export default function StatusCards({ stats }) {
  if (!stats) return null;

  return (
    <div data-testid="status-cards" className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {CARD_CONFIG.map((card) => {
        const data = stats[card.key] || { count: 0, overdue: 0 };
        return (
          <div
            key={card.key}
            data-testid={`status-card-${card.key}`}
            className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#111827] tabular-nums" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {data.count}
                </span>
                <span className="text-sm font-semibold text-[#111827]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {card.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{card.sublabel}</p>
            </div>
            <div className="shrink-0 text-right">
              {data.overdue > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertTriangle size={12} />
                  {data.overdue} Overdue
                </span>
              ) : (
                <span className="text-xs text-gray-400">No Overdues</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
