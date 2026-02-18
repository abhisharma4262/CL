import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { api } from "@/lib/api";
import StatusCards from "@/components/workbench/StatusCards";
import ApplicationsTable from "@/components/workbench/ApplicationsTable";
import ChatBar from "@/components/workbench/ChatBar";
import { toast } from "sonner";

export default function WorkbenchPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.getApplications(search);
      setApplications(res.data.applications);
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Seed on first load if no data
  useEffect(() => {
    if (!loading && applications.length === 0) {
      api.seedDatabase().then(() => {
        fetchApplications();
        toast.success("Database seeded with sample applications");
      }).catch(() => {});
    }
  }, [loading, applications.length, fetchApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateReviewStatus(appId, newStatus);
      fetchApplications();
      toast.success(`Review status updated to "${newStatus}"`);
    } catch {
      toast.error("Failed to update review status");
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div data-testid="workbench-page" className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 space-y-6">
        {/* Status Cards */}
        <StatusCards stats={stats} />

        {/* Discover More Insights */}
        <div className="flex justify-end">
          <button data-testid="discover-insights-btn" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1a3a2a] hover:text-[#55C9A6] transition-colors">
            Discover More Insights
            <Plus size={14} className="p-0.5 rounded-full border border-current" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <button data-testid="filter-btn" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
          <div className="relative flex-1 max-w-md">
            <input
              data-testid="search-input"
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search cases"
              className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#55C9A6] focus:border-[#55C9A6] transition-all"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-6 h-6 border-2 border-[#55C9A6] border-t-transparent rounded-full" />
          </div>
        ) : (
          <ApplicationsTable applications={applications} onStatusChange={handleStatusChange} />
        )}
      </div>

      {/* Chat Bar */}
      <ChatBar />
    </div>
  );
}
