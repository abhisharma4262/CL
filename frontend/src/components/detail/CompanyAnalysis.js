import { ExternalLink, Pencil } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

function FinancialChart({ financials }) {
  if (!financials?.length) return null;
  return (
    <div data-testid="financial-chart" className="mt-4">
      <p className="text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Manrope' }}>
        {financials[0]?.year ? `Financials ${financials[0].year}-${financials[financials.length - 1].year}` : "Financials"}
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={financials} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} label={{ value: "Amount ($B)", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#9CA3AF" } }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} label={{ value: "Operating Margin %", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "#9CA3AF" } }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="amount" name="Amount ($B)" fill="#1F2937" barSize={32} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="operating_margin" name="Operating Margin %" stroke="#55C9A6" strokeWidth={2} dot={{ r: 4, fill: "#55C9A6" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PortersForcesChart({ forces }) {
  if (!forces) return null;
  const data = [
    { subject: "Buyer Power", score: forces.buyer_power?.score || 0, fullMark: 5 },
    { subject: "Supplier Power", score: forces.supplier_power?.score || 0, fullMark: 5 },
    { subject: "New Entrants", score: forces.threat_new_entrants?.score || 0, fullMark: 5 },
    { subject: "Substitutes", score: forces.threat_substitutes?.score || 0, fullMark: 5 },
    { subject: "Rivalry", score: forces.competitive_rivalry?.score || 0, fullMark: 5 },
  ];

  return (
    <div data-testid="porters-forces-chart">
      <p className="text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Manrope' }}>
        Porter's Five Forces Analysis
      </p>
      <p className="text-[10px] text-gray-400 mb-2">2022-2025</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%">
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#374151" }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: "#9CA3AF" }} tickCount={6} />
            <Radar dataKey="score" stroke="#55C9A6" fill="#55C9A6" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 space-y-2">
        {Object.entries(forces).map(([key, val]) => (
          <div key={key} className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">{val.description?.split(' - ')[0] || key} ({val.score}):</span>{' '}
            {val.description?.split(' - ').slice(1).join(' - ') || val.description}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyAnalysis({ application }) {
  if (!application) return null;

  return (
    <div data-testid="company-analysis" className="space-y-6">
      {/* View Detailed Report */}
      <div className="flex justify-end">
        <button data-testid="view-detailed-report" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1a3a2a] transition-colors">
          View detailed report
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Insights Synthesis */}
      {application.insights_synthesis && (
        <div data-testid="insights-synthesis">
          <h3 className="text-lg font-bold text-[#111827] mb-2" style={{ fontFamily: 'Manrope' }}>
            Insights Synthesis (Summary)
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{application.insights_synthesis}</p>
        </div>
      )}

      {/* Two Column: Financial Analysis + Macro Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Analysis */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-[#111827]" style={{ fontFamily: 'Manrope' }}>Financial Analysis</h4>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Pencil size={14} />
            </button>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{application.financial_analysis?.summary}</p>
          <FinancialChart financials={application.financial_analysis?.financials} />
        </div>

        {/* Macro Economic Analysis */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-[#111827]" style={{ fontFamily: 'Manrope' }}>Macro Economic Industry Analysis</h4>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Pencil size={14} />
            </button>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{application.macro_analysis?.summary}</p>
          <PortersForcesChart forces={application.macro_analysis?.porters_forces} />
        </div>
      </div>
    </div>
  );
}
