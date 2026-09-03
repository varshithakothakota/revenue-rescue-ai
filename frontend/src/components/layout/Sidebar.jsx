import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  AlertOctagon,
  Network,
  Compass,
  FileSpreadsheet,
  SlidersHorizontal,
  FlaskConical,
  History,
  ShieldCheck,
  Settings,
  Activity
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/overview", label: "Overview", icon: LayoutDashboard, testId: "nav-overview" },
  { path: "/revenue-at-risk", label: "Revenue at Risk", icon: AlertOctagon, testId: "nav-revenue-at-risk" },
  { path: "/root-causes", label: "Root Cause Intelligence", icon: Network, testId: "nav-root-causes" },
  { path: "/opportunities", label: "Recovery Opportunities", icon: Compass, testId: "nav-opportunities" },
  { path: "/recovery-plans", label: "Recovery Plans", icon: FileSpreadsheet, testId: "nav-recovery-plans" },
  { path: "/simulator", label: "Recovery Simulator", icon: SlidersHorizontal, testId: "nav-simulator" },
  { path: "/experiments", label: "Experiments", icon: FlaskConical, testId: "nav-experiments" },
  { path: "/audit-trail", label: "Audit Trail", icon: History, testId: "nav-audit-trail" },
  { path: "/policies", label: "Policy Center", icon: ShieldCheck, testId: "nav-policies" },
];

export function Sidebar() {
  return (
    <aside
      data-testid="app-sidebar"
      className="w-64 bg-[#0B163F] text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-slate-800"
    >
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2B4BF2] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20">
            RR
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>Revenue Rescue</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-400/30 font-mono">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight">AI Revenue Recovery Engine</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-0.5" aria-label="Main Navigation">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={item.testId}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#2B4BF2] text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 opacity-80" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status & Settings */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          data-testid="nav-settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? "bg-[#2B4BF2] text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Settings className="w-4 h-4 opacity-80" />
          <span>System Settings</span>
        </NavLink>

        <div
          data-testid="system-status-indicator"
          className="px-3 py-2 bg-slate-900/60 rounded border border-slate-800/80 flex items-center justify-between text-[11px]"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono">Engine Status</span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] font-semibold">Active</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
