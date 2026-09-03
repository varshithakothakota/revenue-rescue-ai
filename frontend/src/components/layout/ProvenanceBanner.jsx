import React from "react";
import { Info } from "lucide-react";

export function ProvenanceBanner({ environment = "DEMO", provenance = "SYNTHETIC_BENCHMARK" }) {
  return (
    <div
      data-testid="provenance-banner"
      className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40 font-mono text-[11px] font-semibold">
          {environment === "TEST_MODE" ? "RAZORPAY TEST MODE" : "DEMO / BENCHMARK MODE"}
        </span>
        <span className="text-slate-300 hidden sm:inline">
          Data Provenance:{" "}
          <strong className="text-white font-medium" title="This dataset is generated for controlled development and evaluation. It does not contain real Razorpay customer data.">
            {provenance === "EMPTY"
              ? "Zero Data (Clean Engine Ready)"
              : "Synthetic Benchmark — Not Real Customer Data"}
          </strong>
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
        <span className="hidden md:inline text-rose-300/80">
          • Never Connected to Production
        </span>
      </div>
    </div>
  );
}

export default ProvenanceBanner;
