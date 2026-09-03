import React from "react";
import { FolderOpen, ArrowRight, ShieldCheck, Database } from "lucide-react";

export function EmptyState({
  title = "No data available",
  description = "No revenue events or recovery records have been loaded yet.",
  actionText,
  onAction,
  icon: Icon = FolderOpen,
  testId = "empty-state-container"
}) {
  return (
    <div
      data-testid={testId}
      className="bg-white border border-slate-200 border-dashed rounded-xl p-10 text-center flex flex-col items-center justify-center my-6"
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          data-testid="empty-state-action-btn"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#2B4BF2] hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition-all"
        >
          <Database className="w-3.5 h-3.5" />
          {actionText}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Strict Data Provenance: Synthetic Benchmark & Test Mode Ready</span>
      </div>
    </div>
  );
}

export default EmptyState;
