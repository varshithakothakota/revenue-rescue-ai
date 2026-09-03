import React, { useState, useEffect } from "react";
import axios from "axios";
import { FlaskConical, Scale, ShieldCheck, ArrowRight } from "lucide-react";
import { MoneyValue } from "../components/common/MoneyValue";
import { EmptyState } from "../components/common/EmptyState";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ExperimentsPage({ refreshTrigger, onLoadBenchmark }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/experiments/comparison`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load experiments comparison", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, [refreshTrigger]);

  const hasData = data && data.has_data;

  return (
    <div data-testid="experiments-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          A/B Benchmark Experiments & Evaluation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Controlled evidence-based evaluation comparing <strong>Baseline Static Retries</strong> vs <strong>Revenue Rescue Decision Engine</strong>.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          title="No Active Experiment Dataset"
          description="Load the synthetic benchmark dataset to inspect comparative uplift across recovery rate, incremental revenue, and friction reduction."
          actionText="Load Benchmark Dataset"
          onAction={onLoadBenchmark}
          testId="experiments-empty-state"
        />
      ) : (
        <div className="space-y-6">
          {/* Comparison Table */}
          <div
            data-testid="experiment-comparison-card"
            className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Strategy Performance Matrix
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Dataset: {data.dataset_name}</p>
              </div>
              <span className="text-[11px] font-mono bg-blue-50 text-[#2B4BF2] px-2.5 py-1 rounded border border-blue-200 font-semibold">
                N = {data.sample_size} Events
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Evaluation Metric</th>
                  <th className="px-4 py-3 text-right">Baseline (3 Static Retries)</th>
                  <th className="px-4 py-3 text-right font-bold text-[#2B4BF2]">Revenue Rescue Strategy</th>
                  <th className="px-4 py-3 text-right">Incremental Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {Object.entries(data.metrics).map(([key, val]) => (
                  <tr key={key} data-testid={`metric-row-${key}`} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-sans font-semibold text-slate-800 capitalize">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {val.unit === "INR" ? <MoneyValue amount={val.baseline} /> : `${val.baseline} ${val.unit}`}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 bg-blue-50/20">
                      {val.unit === "INR" ? <MoneyValue amount={val.revenue_rescue} highlight={true} /> : `${val.revenue_rescue} ${val.unit}`}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {val.difference > 0 ? `+` : ""}
                      {val.unit === "INR" ? <MoneyValue amount={val.difference} className="text-emerald-600" /> : `${val.difference} ${val.unit}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Configuration & Methodology Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              data-testid="experiment-config-card"
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2 text-xs"
            >
              <h4 className="font-bold uppercase tracking-wider text-slate-700">Experiment Configuration</h4>
              <p className="text-slate-600"><strong>Control:</strong> {data.experiment_config.control_group}</p>
              <p className="text-slate-600"><strong>Treatment:</strong> {data.experiment_config.treatment_group}</p>
              <p className="text-slate-600"><strong>Allocation:</strong> {data.experiment_config.allocation}</p>
            </div>

            <div
              data-testid="dataset-card"
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2 text-xs"
            >
              <h4 className="font-bold uppercase tracking-wider text-slate-700">Data Provenance Protocol</h4>
              <p className="text-slate-600">
                Evaluation executes against deterministic benchmark models (CUST_BENCH_*, EVENT_BENCH_*). No real customer PII is stored or leaked.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
