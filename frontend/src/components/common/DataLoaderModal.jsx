import React, { useState } from "react";
import {
  X,
  Database,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Sliders
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function DataLoaderModal({ isOpen, onClose, onSuccess }) {
  const [size, setSize] = useState(150);
  const [profile, setProfile] = useState("Balanced");
  const [seed, setSeed] = useState("REVENUE_RESCUE_V1");
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setValidationResult(null);
      const res = await axios.post(`${API}/benchmark/generate`, {
        size: Number(size),
        profile: profile,
        seed: seed || "REVENUE_RESCUE_V1"
      });
      setValidationResult(res.data.validation_report);
      toast.success(res.data.message || "Synthetic benchmark dataset generated successfully.");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Benchmark generation error", err);
      toast.error(err.response?.data?.detail?.message || "Failed to generate benchmark dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="benchmark-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        data-testid="benchmark-modal-content"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Strict Provenance Warning */}
        <div className="p-5 bg-[#0B163F] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2B4BF2] flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Deterministic Benchmark Generator</h3>
              <p className="text-[11px] text-blue-300 font-mono">Dataset Engine v1.1</p>
            </div>
          </div>
          <button
            data-testid="modal-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong>Synthetic Benchmark — Not Real Customer Data</strong>
            <p className="text-[11px] text-amber-700 leading-tight mt-0.5">
              Uses deterministic IDs (CUST_BENCH_*, EVENT_BENCH_*). Never connected to Razorpay production.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs text-slate-800">
          {/* Dataset Size */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1">
              Dataset Size (Revenue Events)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[150, 500, 1000, 5000].map((s) => (
                <button
                  key={s}
                  type="button"
                  data-testid={`size-btn-${s}`}
                  onClick={() => setSize(s)}
                  className={`py-2 px-3 rounded-md text-xs font-mono font-bold border transition-colors ${
                    size === s
                      ? "bg-[#2B4BF2] text-white border-[#2B4BF2] shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s >= 1000 ? `${s / 1000}k` : s}
                  {s === 150 && <span className="block text-[9px] font-normal opacity-80">Demo Default</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Profile */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1">
              Scenario Profile
            </label>
            <select
              data-testid="modal-profile-select"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-900 outline-none focus:border-[#2B4BF2]"
            >
              <option value="Balanced">Balanced (Standard Distribution across Scenarios A-J)</option>
              <option value="Failure Heavy">Failure Heavy (Higher transaction limit & authentication failures)</option>
              <option value="Systemic Incident">Systemic Incident (Correlated Bank & UPI Gateway Outage)</option>
              <option value="Recovery Heavy">Recovery Heavy (High opportunity recoverable revenue)</option>
            </select>
          </div>

          {/* Random Seed */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1">
              Deterministic Seed
            </label>
            <input
              type="text"
              data-testid="modal-seed-input"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. REVENUE_RESCUE_V1"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#2B4BF2]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Identical seeds generate mathematically identical event datasets for repeatable benchmarks.
            </p>
          </div>

          {/* Validation Status Preview */}
          {validationResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-xs text-emerald-800 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{validationResult.summary}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>10 Automated Validation Checks</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="modal-cancel-btn"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              data-testid="modal-confirm-load-btn"
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-[#2B4BF2] hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-all"
            >
              {loading ? "Validating & Generating..." : `Generate & Load ${size} Events`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataLoaderModal;
