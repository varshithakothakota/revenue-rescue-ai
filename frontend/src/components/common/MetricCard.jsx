import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { formatINR } from "./MoneyValue";

export function MetricCard({
  title,
  amount,
  subtitle,
  trend,
  trendType = "positive",
  icon: Icon = TrendingUp,
  isEmpty = false,
  testId
}) {
  return (
    <div
      data-testid={testId || `metric-card-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="w-8 h-8 rounded-md bg-blue-50 text-[#2B4BF2] flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2">
        {isEmpty ? (
          <div className="py-1">
            <span className="text-xl font-semibold text-slate-400 font-mono">--</span>
            <p className="text-xs text-slate-400 mt-1">No revenue events loaded</p>
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {formatINR(amount, true)}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Exact: {formatINR(amount, false)}
            </div>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{subtitle}</span>
          {trend && (
            <span
              className={`font-medium ${
                trendType === "positive"
                  ? "text-emerald-600"
                  : trendType === "negative"
                  ? "text-rose-600"
                  : "text-slate-600"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
