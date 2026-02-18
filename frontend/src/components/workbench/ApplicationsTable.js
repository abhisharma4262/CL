import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, AlertTriangle, ChevronDown, ChevronUp, Eye, CircleCheck, CircleX, Clock } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ExpandedRow from "./ExpandedRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DOC_ICONS = {
  verified: <Check size={14} className="text-emerald-600" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
  missing: <X size={14} className="text-red-500" />,
};

const APP_STATUS_STYLES = {
  "AI Approved": "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]",
  "AI Rejected": "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]",
  "On Hold by AI": "bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]",
};

const REVIEW_STATUS_CONFIG = {
  "Review Pending": { icon: Eye, style: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]" },
  "Approved": { icon: CircleCheck, style: "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]" },
  "Awaiting Instructions": { icon: Clock, style: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]" },
  "Rejected": { icon: CircleX, style: "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]" },
};

const COLUMNS = [
  { key: "application_no", label: "Application No." },
  { key: "applicant_name", label: "Applicant Name" },
  { key: "industry", label: "Industry" },
  { key: "loan_amount_display", label: "Loan Amount" },
  { key: "legal_entity_type", label: "Legal Entity Type" },
  { key: "application_stage", label: "Application Stage" },
  { key: "documents_status", label: "Documents" },
  { key: "application_status", label: "Application Status" },
  { key: "review_status", label: "Review Status" },
];

export default function ApplicationsTable({ applications, onStatusChange }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleNameClick = (app) => {
    navigate(`/application/${app.id}`);
  };

  return (
    <div data-testid="applications-table" className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/90 backdrop-blur">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-semibold whitespace-nowrap"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  {col.label}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const reviewConfig = REVIEW_STATUS_CONFIG[app.review_status] || REVIEW_STATUS_CONFIG["Review Pending"];
              const ReviewIcon = reviewConfig.icon;
              const isExpanded = expandedRow === app.id;

              return (
                <tr key={app.id} className="border-t border-gray-100">
                  <td colSpan={COLUMNS.length + 1} className="p-0">
                    {/* Main Row */}
                    <div className="app-table-row flex items-center cursor-pointer" onClick={() => toggleRow(app.id)}>
                      <div className="flex-1 flex items-center">
                        <span className="px-4 py-3 text-sm text-gray-600 w-[120px] shrink-0 tabular-nums">{app.application_no}</span>
                        <button
                          data-testid={`app-name-${app.application_no}`}
                          onClick={(e) => { e.stopPropagation(); handleNameClick(app); }}
                          className="px-4 py-3 text-sm font-medium text-[#1a3a2a] hover:text-[#55C9A6] transition-colors w-[140px] shrink-0 text-left"
                        >
                          {app.applicant_name}
                        </button>
                        <span className="px-4 py-3 text-sm text-gray-600 w-[120px] shrink-0">{app.industry}</span>
                        <span className="px-4 py-3 text-sm text-gray-800 font-medium w-[110px] shrink-0 tabular-nums">{app.loan_amount_display}</span>
                        <span className="px-4 py-3 text-sm text-gray-600 w-[130px] shrink-0">{app.legal_entity_type}</span>
                        <span className="px-4 py-3 text-sm text-gray-600 w-[130px] shrink-0">{app.application_stage}</span>
                        <span className="px-4 py-3 w-[90px] shrink-0 flex items-center justify-center">
                          {DOC_ICONS[app.documents_status]}
                        </span>
                        <span className="px-4 py-3 w-[140px] shrink-0">
                          <span className={`status-badge inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${APP_STATUS_STYLES[app.application_status] || ""}`}>
                            {app.application_status}
                          </span>
                        </span>
                        <span className="px-4 py-3 w-[180px] shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button
                                data-testid={`review-status-${app.application_no}`}
                                className={`status-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${reviewConfig.style}`}
                              >
                                <ReviewIcon size={12} />
                                {app.review_status}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {Object.keys(REVIEW_STATUS_CONFIG).map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  data-testid={`review-option-${status.toLowerCase().replace(/\s/g, '-')}`}
                                  onClick={() => onStatusChange?.(app.id, status)}
                                >
                                  {status}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </span>
                      </div>
                      <button
                        data-testid={`expand-row-${app.application_no}`}
                        className="px-3 py-3 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={(e) => { e.stopPropagation(); toggleRow(app.id); }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && <ExpandedRow application={app} />}
                    </AnimatePresence>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
