import React from "react";

export function StatusBadge({ status, className = "" }) {
  if (!status) return null;
  
  const map = {
    FAILED: { label: "Failed", bg: "bg-rose-50 text-rose-700 border-rose-200" },
    Failed: { label: "Failed", bg: "bg-rose-50 text-rose-700 border-rose-200" },
    CAPTURED: { label: "Captured", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Captured: { label: "Captured", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    RECOVERED: { label: "Recovered", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Recovered: { label: "Recovered", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    AT_RISK: { label: "At Risk", bg: "bg-rose-50 text-rose-700 border-rose-200" },
    "At Risk": { label: "At Risk", bg: "bg-rose-50 text-rose-700 border-rose-200" },
    WAITING: { label: "Waiting (Cooldown)", bg: "bg-sky-50 text-sky-700 border-sky-200" },
    Waiting: { label: "Waiting (Cooldown)", bg: "bg-sky-50 text-sky-700 border-sky-200" },
    ACTION_REQUIRED: { label: "Action Required", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    "Action Required": { label: "Action Required", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    SYSTEMIC_ISSUE: { label: "Systemic Issue", bg: "bg-purple-50 text-purple-700 border-purple-200" },
    "Systemic Issue": { label: "Systemic Issue", bg: "bg-purple-50 text-purple-700 border-purple-200" },
    ESCALATED: { label: "Escalated to KAM", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    Escalated: { label: "Escalated to KAM", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    STOPPED: { label: "Stopped", bg: "bg-slate-100 text-slate-700 border-slate-300" },
    Stopped: { label: "Stopped", bg: "bg-slate-100 text-slate-700 border-slate-300" },
    BLOCKED_BY_POLICY: { label: "Blocked by Policy", bg: "bg-red-50 text-red-800 border-red-300" },
    "Blocked by Policy": { label: "Blocked by Policy", bg: "bg-red-50 text-red-800 border-red-300" },
    ALREADY_RECOVERED: { label: "Already Recovered", bg: "bg-teal-50 text-teal-700 border-teal-200" },
    "Already Recovered": { label: "Already Recovered", bg: "bg-teal-50 text-teal-700 border-teal-200" },
    UNDER_INVESTIGATION: { label: "Under Investigation", bg: "bg-blue-50 text-blue-700 border-blue-200" },
    "Under Investigation": { label: "Under Investigation", bg: "bg-blue-50 text-blue-700 border-blue-200" }
  };

  const item = map[status] || { label: status, bg: "bg-slate-50 text-slate-700 border-slate-200" };

  return (
    <span
      data-testid={`status-badge-${status.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${item.bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {item.label}
    </span>
  );
}

export function RiskBadge({ risk, className = "" }) {
  if (!risk) return null;
  const map = {
    "High Risk": "bg-rose-50 text-rose-700 border-rose-200",
    "Moderate Risk": "bg-amber-50 text-amber-700 border-amber-200",
    "Low Risk": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Systemic Failure": "bg-purple-50 text-purple-700 border-purple-200",
    "Temporary Hold": "bg-blue-50 text-blue-700 border-blue-200"
  };
  const color = map[risk] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      data-testid={`risk-badge-${risk.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color} ${className}`}
    >
      {risk}
    </span>
  );
}

export function ActionBadge({ action, className = "" }) {
  if (!action) return null;
  const map = {
    "Do nothing": "bg-slate-100 text-slate-700 border-slate-200",
    "DO_NOT_INTERVENE": "bg-slate-100 text-slate-700 border-slate-200",
    "Wait": "bg-sky-50 text-sky-700 border-sky-200",
    "WAIT": "bg-sky-50 text-sky-700 border-sky-200",
    "Retry": "bg-orange-50 text-orange-700 border-orange-200",
    "RETRY": "bg-orange-50 text-orange-700 border-orange-200",
    "Alternative payment method": "bg-blue-50 text-blue-700 border-blue-200",
    "ALTERNATIVE_PAYMENT_METHOD": "bg-blue-50 text-blue-700 border-blue-200",
    "Payment link": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "PAYMENT_LINK": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Customer communication": "bg-violet-50 text-violet-700 border-violet-200",
    "CUSTOMER_COMMUNICATION": "bg-violet-50 text-violet-700 border-violet-200",
    "Merchant action": "bg-amber-50 text-amber-700 border-amber-200",
    "MERCHANT_ACTION": "bg-amber-50 text-amber-700 border-amber-200",
    "Human escalation": "bg-rose-50 text-rose-700 border-rose-200",
    "HUMAN_ESCALATION": "bg-rose-50 text-rose-700 border-rose-200"
  };
  const color = map[action] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      data-testid={`action-badge-${action.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${color} ${className}`}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
}

export function PolicyBadge({ status, className = "" }) {
  if (!status) return null;
  const map = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Blocked: "bg-rose-50 text-rose-700 border-rose-200",
    "Needs Review": "bg-amber-50 text-amber-700 border-amber-200",
    PASSED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ALLOWED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
    BLOCKED: "bg-rose-50 text-rose-700 border-rose-200",
    FLAGGED_FOR_HUMAN: "bg-amber-50 text-amber-700 border-amber-200",
    REQUIRES_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200"
  };
  const color = map[status] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      data-testid={`policy-badge-${status.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color} ${className}`}
    >
      {status}
    </span>
  );
}
