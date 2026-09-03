import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import axios from "axios";

// Layout components
import Sidebar from "./components/layout/Sidebar";
import TopHeader from "./components/layout/TopHeader";
import ProvenanceBanner from "./components/layout/ProvenanceBanner";

// Pages
import OverviewPage from "./pages/OverviewPage";
import RevenueAtRiskPage from "./pages/RevenueAtRiskPage";
import RootCausesPage from "./pages/RootCausesPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import RecoveryPlansPage from "./pages/RecoveryPlansPage";
import SimulatorPage from "./pages/SimulatorPage";
import ExperimentsPage from "./pages/ExperimentsPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import PoliciesPage from "./pages/PoliciesPage";
import SettingsPage from "./pages/SettingsPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [systemStatus, setSystemStatus] = useState(null);

  const fetchSystemStatus = async () => {
    try {
      const res = await axios.get(`${API}/system/status`);
      setSystemStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch system status", err);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <div data-testid="app-root" className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
        <Toaster position="top-right" richColors />
        
        {/* Top Provenance Banner */}
        <ProvenanceBanner
          environment={systemStatus?.environment || "DEMO"}
          provenance={systemStatus?.data_source || "SYNTHETIC_BENCHMARK"}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Persistent Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopHeader
              systemStatus={systemStatus}
              onRefreshData={handleRefresh}
              activeMerchant={systemStatus?.active_merchant?.merchant_name || "Acme Digital India Pvt Ltd"}
              activeEnvironment={systemStatus?.environment || "DEMO"}
            />

            <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route
                  path="/overview"
                  element={
                    <OverviewPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route
                  path="/revenue-at-risk"
                  element={
                    <RevenueAtRiskPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route
                  path="/root-causes"
                  element={
                    <RootCausesPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route
                  path="/opportunities"
                  element={
                    <OpportunitiesPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route
                  path="/recovery-plans"
                  element={
                    <RecoveryPlansPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route path="/simulator" element={<SimulatorPage />} />
                <Route
                  path="/experiments"
                  element={
                    <ExperimentsPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route
                  path="/audit-trail"
                  element={
                    <AuditTrailPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route
                  path="/settings"
                  element={
                    <SettingsPage
                      refreshTrigger={refreshTrigger}
                      onRefresh={handleRefresh}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/overview" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
