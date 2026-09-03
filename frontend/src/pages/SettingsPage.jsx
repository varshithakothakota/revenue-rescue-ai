import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Database, RefreshCw, ShieldCheck, Server, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { DataLoaderModal } from "../components/common/DataLoaderModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SettingsPage({ refreshTrigger, onRefresh }) {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/system/status`);
      setSystemStatus(res.data);
    } catch (err) {
      console.error("Failed to load system status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [refreshTrigger]);

  const handleClear = async () => {
    try {
      const res = await axios.post(`${API}/benchmark/clear`);
      toast.info(res.data.message || "All records cleared.");
      fetchStatus();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Failed to clear dataset.");
    }
  };

  return (
    <div data-testid="settings-page" className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Status & Environment Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage data environments, benchmark datasets, and Razorpay Test Mode adapter status.
        </p>
      </div>

      {/* Environment & Provenance Status */}
      <div
        data-testid="settings-status-card"
        className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 text-xs"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Environment & Data Provenance Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Active Environment</span>
            <div className="font-mono font-bold text-[#2B4BF2] text-sm">
              {systemStatus?.environment || "DEMO"}
            </div>
            <p className="text-[11px] text-slate-500">Allowed: DEMO, TEST_MODE (Production is disabled)</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Data Provenance Protocol</span>
            <div className="font-mono font-bold text-slate-900 text-sm">
              {systemStatus?.data_source_label || "Zero Data"}
            </div>
            <p className="text-[11px] text-slate-500">
              Deterministic benchmark records ({systemStatus?.total_events_loaded || 0} events, {systemStatus?.total_customers_loaded || 0} customer archetypes)
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Dataset Management */}
      <div
        data-testid="settings-benchmark-card"
        className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 text-xs"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Deterministic Synthetic Benchmark Dataset Controls
        </h3>
        <p className="text-slate-600 leading-relaxed">
          The synthetic benchmark dataset models real-world payment failures documented across the Indian fintech ecosystem (UPI timeouts, salary-cycle mandate debits, bank core-banking downtime, and hard card declines).
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            data-testid="settings-load-benchmark-btn"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B4BF2] hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Open Benchmark Dataset Generator</span>
          </button>

          <button
            data-testid="settings-clear-data-btn"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear All Data (Clean Empty State)</span>
          </button>
        </div>
      </div>

      {/* Razorpay Integration Adapter Architecture (Prepared for Next Step) */}
      <div
        data-testid="razorpay-adapter-card"
        className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3 text-xs"
      >
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Razorpay Test Mode Integration Adapter Layer
          </h3>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Clean adapter interface configured for Razorpay Test Mode API keys and webhook ingestion (<code>payment.failed</code>, <code>payment.captured</code>, <code>order.paid</code>). Credentials remain strictly server-side.
        </p>

        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded text-slate-700 text-[11px] font-mono">
          Adapter Status: <strong>READY_FOR_TEST_MODE_CREDENTIALS</strong> (No hardcoded credentials)
        </div>
      </div>

      <DataLoaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchStatus();
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
