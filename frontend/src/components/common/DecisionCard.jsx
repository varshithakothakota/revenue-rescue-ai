import React from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  XCircle
} from "lucide-react";
import { MoneyValue } from "./MoneyValue";
import { ActionBadge, PolicyBadge } from "./Badges";

export function DecisionCard({ decisionCard, amountAtRisk, className = "" }) {
  if (!decisionCard) return null;

  const {
    action = "SEND PAYMENT LINK",
    why = "",
    alternatives = [],
    evidence = [],
    recoverability_grade = "HIGH",
    recoverability_score = 90,
    expected_recovery_value = 0,
    policy_check = { status: "APPROVED", rule: "Compliant" }
  } = decisionCard;

  const isDoNothing = action === "DO NOTHING" || action === "DO_NOT_INTERVENE";

  return (
    <div
      data-testid="ai-decision-card"
      className={`rounded-xl border p-5 space-y-4 shadow-sm transition-all ${
        isDoNothing
          ? "bg-slate-900 text-white border-slate-800"
          : "bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/50 border-[#2B4BF2]/30 ring-1 ring-blue-500/20"
      } ${className}`}
    >
      {/* Header & Main Decision */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200/80">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDoNothing ? "bg-slate-800 text-slate-300" : "bg-[#2B4BF2] text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                isDoNothing ? "text-slate-400" : "text-[#2B4BF2]"
              }`}
            >
              AI Decision Recommendation
            </span>
            <div className="text-sm font-bold tracking-tight flex items-center gap-2">
              <span className={isDoNothing ? "text-white" : "text-slate-900"}>
                {action}
              </span>
              <PolicyBadge status={policy_check.status} />
            </div>
          </div>
        </div>

        {/* Recoverability Score Badge */}
        <div className="text-right">
          <div
            data-testid="recoverability-score"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
              recoverability_grade === "HIGH"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : recoverability_grade === "MEDIUM"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <span>Recoverability: {recoverability_grade}</span>
            <span className="opacity-60">— {recoverability_score}</span>
          </div>
        </div>
      </div>

      {/* Financial Rationale Line */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-white/60 p-3 rounded-lg border border-slate-200/60 backdrop-blur-sm">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Revenue at Risk</span>
          <MoneyValue amount={amountAtRisk} className="text-sm font-bold text-slate-900" />
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Expected Recovery</span>
          <MoneyValue
            amount={expected_recovery_value}
            className={`text-sm font-bold ${isDoNothing ? "text-slate-600" : "text-emerald-600"}`}
          />
        </div>
      </div>

      {/* "Why?" Evidence-Backed Explanation */}
      <div className="space-y-1.5 text-xs">
        <h5
          className={`font-bold uppercase tracking-wider text-[11px] ${
            isDoNothing ? "text-slate-300" : "text-slate-800"
          }`}
        >
          Why This Action?
        </h5>
        <p
          className={`leading-relaxed text-xs ${
            isDoNothing ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {why}
        </p>
      </div>

      {/* Supporting Evidence Signals */}
      {evidence.length > 0 && (
        <div className="space-y-1 text-xs">
          <span
            className={`text-[10px] uppercase font-bold tracking-wider ${
              isDoNothing ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Evidence Considered
          </span>
          <div className="space-y-1">
            {evidence.map((ev, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-[11px] p-1.5 rounded ${
                  isDoNothing
                    ? "bg-slate-800/80 text-slate-300"
                    : "bg-white/80 text-slate-700 border border-slate-200/50"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives Considered */}
      {alternatives.length > 0 && (
        <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/60">
          <span
            className={`text-[10px] uppercase font-bold tracking-wider ${
              isDoNothing ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Alternatives Considered
          </span>
          <div className="grid grid-cols-1 gap-1">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className={`text-[11px] p-2 rounded flex items-start gap-2 ${
                  isDoNothing
                    ? "bg-slate-800/50 text-slate-400"
                    : "bg-slate-50/80 text-slate-600 border border-slate-200/40"
                }`}
              >
                <strong className={isDoNothing ? "text-slate-200" : "text-slate-900"}>
                  {alt.action}:
                </strong>
                <span>{alt.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guardrail Policy Check Result */}
      <div
        className={`p-2.5 rounded text-xs flex items-center justify-between ${
          isDoNothing
            ? "bg-slate-800 text-slate-300"
            : "bg-blue-50/80 text-blue-900 border border-blue-100"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2B4BF2]" />
          <span>Guardrail Policy: <strong>{policy_check.rule}</strong></span>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase">{policy_check.status}</span>
      </div>
    </div>
  );
}

export default DecisionCard;
