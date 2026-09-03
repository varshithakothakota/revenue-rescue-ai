import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Bell,
  User,
  Database,
  RefreshCw,
  Info
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import DataLoaderModal from "../common/DataLoaderModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function TopHeader({
  systemStatus,
  onRefreshData,
  activeMerchant = "Acme Digital India Pvt Ltd",
  activeEnvironment = "DEMO"
}) {
  const [env, setEnv] = useState(activeEnvironment);
  const [merchant, setMerchant] = useState(activeMerchant);
  const [dateRange, setDateRange] = useState("Last 30 Days (June 2026)");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleClearData = async () => {
    try {
      setLoadingAction(true);
      const res = await axios.post(`${API}/benchmark/clear`);
      toast.info(res.data.message || "All records cleared (Empty state ready).");
      if (onRefreshData) onRefreshData();
    } catch (err) {
      toast.error("Failed to reset dataset.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <header
        data-testid="app-top-header"
        className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 select-none shrink-0"
      >
        {/* Merchant Selector */}
        <div className="flex items-center gap-4">
          <div
            data-testid="merchant-selector"
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-[#2B4BF2]" />
            <select
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              data-testid="merchant-dropdown"
            >
              <option value="Acme Digital India Pvt Ltd">Acme Digital India Pvt Ltd</option>
              <option value="Razorpay Sandbox Store">Razorpay Sandbox Store</option>
              <option value="Nova SaaS Technologies">Nova SaaS Technologies</option>
            </select>
          </div>

          {/* Environment Indicator (Demo / Test Mode only - NEVER Production) */}
          <div
            data-testid="environment-selector"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[#2B4BF2]"></span>
            <span className="text-slate-600 text-[11px]">Env:</span>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#2B4BF2] outline-none cursor-pointer"
              data-testid="environment-dropdown"
            >
              <option value="DEMO">Demo Environment</option>
              <option value="TEST_MODE">Razorpay Test Mode</option>
            </select>
          </div>
        </div>

        {/* Middle: Synthetic Benchmark Quick Action & Data Source Indicator */}
        <div className="flex items-center gap-2">
          <button
            data-testid="benchmark-load-btn"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2B4BF2] hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-all"
            title="Open Deterministic Benchmark Generator"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Load Benchmark Dataset</span>
          </button>

          <button
            data-testid="benchmark-clear-btn"
            onClick={handleClearData}
            disabled={loadingAction}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors border border-slate-200"
            title="Reset to clean empty state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear Data</span>
          </button>
        </div>

        {/* Right: Date Range, Notifications, Profile */}
        <div className="flex items-center gap-3">
          <div
            data-testid="date-range-picker"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-[11px] font-medium">{dateRange}</span>
          </div>

          <button
            data-testid="notifications-button"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 relative transition-colors"
            title="Policy & System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>

          <div
            data-testid="user-profile-header"
            className="flex items-center gap-2 pl-2 border-l border-slate-200"
          >
            <div className="w-7 h-7 rounded-full bg-[#0B163F] text-white flex items-center justify-center text-xs font-bold font-mono">
              FO
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-none">Finance Ops Lead</div>
              <div className="text-[10px] text-slate-500 leading-tight">RevOps & Risk</div>
            </div>
          </div>
        </div>
      </header>

      <DataLoaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefreshData}
      />
    </>
  );
}

export default TopHeader;
