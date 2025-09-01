// src/App.tsx
import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AlertProvider from "./components/AlertProvider";
import BackupDialogManager from "./components/BackupDialogManager";
import DynamicWindowTitle from "./components/DynamicWindowTitle";
import SerialActivation from "./components/SerialActivation";
import UpdateNotification from "./components/UpdateNotification";
import { configureFlags } from "./config/featureFlags";
import { NotificationProvider } from "./contexts/NotificationContext";
import MainLayout from "./layouts/MainLayout";
import CashRegisterPage from "./pages/CashRegisterPage";
import CreditPage from "./pages/CreditPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import ProductsPage from "./pages/ProductsPage";
import SaleDetailPage from "./pages/SaleDetailPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import { initBackupBridge } from "./utils/backup-bridge";
import { isLicenseBypassEnabled } from "./utils/feature-flags";
// Yedekleme dialog manager bileşenini import et

function App() {
  const [isActivated, setIsActivated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Feature flags: load persisted overrides from localStorage
    try {
      const parse = (v: string | null) => {
        if (v === null) {
          return undefined as unknown as boolean;
        }
        const val = v.trim().toLowerCase();
        return val === "true" || val === "1" || val === "on" || val === "yes";
      };
      const registerRecovery = parse(localStorage.getItem("featureFlags.registerRecovery"));
      const escposDrawer = parse(localStorage.getItem("featureFlags.escposDrawer"));
      const overrides: Record<string, boolean> = {};
      if (typeof registerRecovery === "boolean") {
        overrides.registerRecovery = registerRecovery;
      }
      if (typeof escposDrawer === "boolean") {
        overrides.escposDrawer = escposDrawer;
      }
      if (Object.keys(overrides).length > 0) {
        configureFlags(overrides as unknown as { registerRecovery?: boolean; escposDrawer?: boolean });
      }
    } catch {
      /* ignore */ void 0;
    }

    // Lisans/aktivasyon bypass modu (yalnız dev/test)
    if (isLicenseBypassEnabled()) {
      try {
        if (typeof console !== 'undefined') {
          console.warn('[Lisans] BYPASS aktif (dev/test). Aktivasyon kontrolü atlandı.');
        }
      } catch { /* ignore */ void 0; }
      setIsActivated(true);
      setIsChecking(false);
    } else {
      checkSerial();
    }

    // YENİ: Backup köprüsünü başlat
    initBackupBridge();
  }, []);

  const checkSerial = async () => {
    try {
      const result = await window.ipcRenderer.invoke("check-serial");
      setIsActivated(result.isValid);
    } catch (error) {
      console.error("Serial kontrol hatası:", error);
      setIsActivated(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">Serial numarası kontrol ediliyor...</div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <NotificationProvider>
          {!isActivated ? (
            <AlertProvider>
              <div className="h-screen">
                <SerialActivation onSuccess={() => setIsActivated(true)} />
              </div>
            </AlertProvider>
          ) : (
            <MainLayout>
              <AlertProvider>
                <Routes>
                  <Route path="/" element={<POSPage />} />
                  <Route path="/pos" element={<POSPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/credit" element={<CreditPage />} />
                  <Route path="/history" element={<SalesHistoryPage />} />
                  <Route path="/cash" element={<CashRegisterPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/sales/:id" element={<SaleDetailPage />} />
                  {/* Dashboard ana rotası - overview'a yönlendir */}
                  <Route
                    path="/dashboard"
                    element={<Navigate to="/dashboard/overview" replace />}
                  />

                  {/* Dashboard alt rotaları */}
                  <Route
                    path="/dashboard/:tabKey"
                    element={<DashboardPage />}
                  />
                </Routes>
              </AlertProvider>
            </MainLayout>
          )}
        </NotificationProvider>
      </Router>
      <UpdateNotification />
      <DynamicWindowTitle />
      {/* Kapatma öncesi yedekleme yöneticisi */}
      <BackupDialogManager />
    </>
  );
}

export default App;