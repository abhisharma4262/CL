import { motion } from "framer-motion";
import { Check, X, AlertTriangle, FileText, CircleCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const DOC_ICONS = {
  verified: <Check size={12} className="text-emerald-600" />,
  warning: <AlertTriangle size={12} className="text-amber-500" />,
  missing: <X size={12} className="text-red-500" />,
};

const RECOMMEND_STYLES = {
  "Approve Loan": { bg: "bg-[#ECFDF5]", text: "text-[#047857]", border: "border-[#A7F3D0]", icon: CircleCheck },
  "Reject Loan": { bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]", border: "border-[#FECACA]", icon: X },
  "Hold": { bg: "bg-[#FFFBEB]", text: "text-[#B45309]", border: "border-[#FDE68A]", icon: AlertTriangle },
};

function MiniChart({ data, dataKey, color = "#55C9A6" }) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #E5E7EB" }}
            formatter={(v) => [typeof v === 'number' && v < 10 ? v.toFixed(2) : v, dataKey === "value" ? "" : dataKey]}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ExpandedRow({ application }) {
  const rec = application.ai_recommendation || {};
  const recStyle = RECOMMEND_STYLES[rec.action] || RECOMMEND_STYLES["Hold"];
  const RecIcon = recStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
      data-testid={`expanded-row-${application.application_no}`}
    >
      <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-6">
          {/* AI Recommendation + Documents */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3" style={{ fontFamily: 'IBM Plex Sans' }}>
              Underwriter AI Agent recommends
            </p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${recStyle.bg} ${recStyle.text} ${recStyle.border}`}>
              <RecIcon size={13} /> {rec.action}
            </span>
            <p className="text-xs text-gray-500 mt-2">{rec.notes}</p>

            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">View Documents</p>
              <div className="space-y-1.5">
                {(application.documents || []).map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <FileText size={12} className="text-[#55C9A6]" />
                    <span className="text-[#1D4ED8] hover:underline cursor-pointer">{doc.name}</span>
                    {DOC_ICONS[doc.status]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company & Industry Insights */}
          <div className="col-span-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Company & Industry Insights</p>
            <div className="space-y-3">
              {(application.company_insights || []).map((insight, i) => (
                <p key={i} className="text-xs text-gray-600 leading-relaxed">{insight}</p>
              ))}
            </div>
          </div>

          {/* Key Ratios */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Key Ratios</p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">D/E</span>
                  <div className="flex gap-3">
                    {(application.key_ratios?.debt_to_equity || []).map((d, i) => (
                      <span key={i} className="text-[10px] text-gray-500 tabular-nums">{d.value}</span>
                    ))}
                  </div>
                </div>
                <MiniChart data={application.key_ratios?.debt_to_equity || []} dataKey="value" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">ICR</span>
                  <div className="flex gap-3">
                    {(application.key_ratios?.interest_coverage || []).map((d, i) => (
                      <span key={i} className="text-[10px] text-gray-500 tabular-nums">{d.value}x</span>
                    ))}
                  </div>
                </div>
                <MiniChart data={application.key_ratios?.interest_coverage || []} dataKey="value" />
              </div>
              <div className="flex gap-4 text-[10px] text-gray-400">
                {(application.key_ratios?.debt_to_equity || []).map((d, i) => (
                  <span key={i}>{d.year}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Covenant Recommendations */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Covenant Recommendations</p>
            <div className="space-y-2.5">
              {(application.covenant_recommendations || []).map((cov, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-[#1a3a2a] shrink-0 tabular-nums">{cov.value}</span>
                  <span className="text-xs text-gray-500">{cov.metric}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
