import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "@/components/detail/ChatPanel";
import CompanyAnalysis from "@/components/detail/CompanyAnalysis";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.getApplication(id);
        setApplication(res.data);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-6 h-6 border-2 border-[#55C9A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!application) return null;

  return (
    <div data-testid="application-detail-page" className="flex h-full">
      {/* Left Panel: Chat */}
      <div className="w-[400px] shrink-0 flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Application Title */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              data-testid="back-to-workbench"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <h2
              className="text-base font-bold text-[#1a3a2a] tracking-tight"
              style={{ fontFamily: 'Manrope' }}
            >
              {application.application_no} - {application.applicant_name}
            </h2>
            <ChevronDown size={14} className="text-[#55C9A6]" />
          </div>
        </div>
        <ChatPanel application={application} />
      </div>

      {/* Right Panel: Tabbed Content */}
      <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#F9FAFB]">
        <div className="p-6">
          <Tabs defaultValue="company-analysis" className="w-full">
            <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start gap-0 h-auto p-0">
              {[
                { value: "company-analysis", label: "Company Analysis", active: true },
                { value: "financial-spreading", label: "Financial Spreading" },
                { value: "financial-ratios", label: "Financial Ratios" },
                { value: "projections", label: "Projections" },
                { value: "covenants", label: "Covenants" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  data-testid={`tab-${tab.value}`}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#55C9A6] data-[state=active]:bg-transparent data-[state=active]:text-[#1a3a2a] data-[state=active]:font-semibold data-[state=active]:shadow-none text-gray-400 font-medium text-sm px-4 py-2.5 transition-all"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    tab.value === "company-analysis" ? "bg-[#55C9A6]" : "bg-gray-300"
                  }`} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="company-analysis" className="mt-6">
              <CompanyAnalysis application={application} />
            </TabsContent>

            <TabsContent value="financial-spreading" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">Financial Spreading analysis will be available in Phase 2</p>
              </div>
            </TabsContent>

            <TabsContent value="financial-ratios" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">Financial Ratios analysis will be available in Phase 2</p>
              </div>
            </TabsContent>

            <TabsContent value="projections" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">Projections analysis will be available in Phase 2</p>
              </div>
            </TabsContent>

            <TabsContent value="covenants" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">Covenants analysis will be available in Phase 2</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
