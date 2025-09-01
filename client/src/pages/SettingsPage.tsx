// pages/SettingsPage.tsx
import { Printer, Barcode, Building, Key, Check, RefreshCw, Database, Info, Wrench, Settings as Gear } from "lucide-react";
import React, { useState, useEffect, lazy, Suspense } from "react";

import { isSerialFeatureEnabled, isAdminModeEnabled } from "../utils/feature-flags";

import useSettingsPage from "./settings/hooks/useSettingsPage";


// Lazy load components for better performance
const POSSettingsTab = lazy(() => import("../components/settings/POSSettingsTab"));
const BarcodeSettingsTab = lazy(() => import("../components/settings/BarcodeSettingsTab"));
const ReceiptSettingsTab = lazy(() => import("../components/settings/ReceiptSettingsTab"));
const BackupSettingsTab = lazy(() => import("../components/settings/BackupSettingsTab"));
const SerialSettingsTab = lazy(() => import("../components/settings/SerialSettingsTab"));
const AboutTab = lazy(() => import("../components/settings/AboutTab"));
const DiagnosticsTab = lazy(() => import("../components/settings/DiagnosticsTab"));
const HotkeySettings = lazy(() => import("../components/HotkeySettings"));
const ExperimentalFeaturesTab = lazy(() => import("../components/settings/ExperimentalFeaturesTab"));

// Loading component for lazy-loaded tabs
const TabLoading: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center gap-2">
      <RefreshCw size={20} className="animate-spin" />
      <span>Yükleniyor...</span>
    </div>
  </div>
);

interface SettingsTab {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SettingsPage: React.FC = () => {
  const {
    appVersion,
    // POS
    posConfig,
    setPosConfig,
    serialOptions,
    setSerialOptions,
    connectionStatus,
    onTestConnection,
    // Barcode
    barcodeConfig,
    setBarcodeConfig,
    // Receipt
    receiptConfig,
    setReceiptConfig,
    // Backup
    backupDirectory,
    setBackupDirectory,
    backups,
    backupLoading,
    restoreLoading,
    backupProgress,
    backupSchedule,
    setBackupSchedule,
    onSelectBackupDirectory,
    onCreateBackup,
    onSelectBackupFile,
    onRestoreBackup,
    onDeleteBackup,
    // Serial
    serialInfo,
    newSerialNo,
    setNewSerialNo,
    serialStatus,
    onActivateSerial,
    onDeactivateSerial,
    // Save status/actions
    saveStatus,
    onSavePOS,
    onSaveBarcode,
    onSaveReceipt,
    onSaveBackup,
    onSaveSerial,
    // About
    onCheckForUpdates,
    onOpenLogs,
    onOpenWebsite,
  } = useSettingsPage();

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return localStorage.getItem("settings.activeTab") || "pos";
    } catch {
      return "pos";
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem("settings.activeTab", activeTab);
    } catch { /* ignore */ void 0; }
  }, [activeTab]);
  
  // Settings tabs (Serial sekmesi feature flag ile koşullu)
  const tabs: SettingsTab[] = [
    { id: "pos", title: "POS Cihazı", icon: <Printer size={20} /> },
    { id: "barcode", title: "Barkod Okuyucu", icon: <Barcode size={20} /> },
    { id: "receipt", title: "Fiş ve İşletme", icon: <Building size={20} /> },
    { id: "backup", title: "Yedekleme", icon: <Database size={20} /> },
    { id: "hotkeys", title: "Kısayollar", icon: <Key size={20} /> },
    ...(isSerialFeatureEnabled() ? [{ id: "serial", title: "Serial No", icon: <Check size={20} /> }] : []),
    { id: "diagnostics", title: "Tanılama", icon: <Wrench size={20} /> },
    { id: "experimental", title: "Deneysel", icon: <Gear size={20} /> },
    { id: "about", title: "Hakkında", icon: <Info size={20} /> },
  ];

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "pos":
        return (
          <Suspense fallback={<TabLoading />}>
            <POSSettingsTab
              posConfig={posConfig}
              setPosConfig={setPosConfig}
              serialOptions={serialOptions}
              setSerialOptions={setSerialOptions}
              connectionStatus={connectionStatus}
              onTestConnection={onTestConnection}
              onSave={onSavePOS}
              saveStatus={saveStatus}
            />
          </Suspense>
        );
      case "barcode":
        return (
          <Suspense fallback={<TabLoading />}>
            <BarcodeSettingsTab
              barcodeConfig={barcodeConfig}
              setBarcodeConfig={setBarcodeConfig}
              onSave={onSaveBarcode}
              saveStatus={saveStatus}
            />
          </Suspense>
        );
      case "receipt":
        return (
          <Suspense fallback={<TabLoading />}>
            <ReceiptSettingsTab
              receiptConfig={receiptConfig}
              setReceiptConfig={setReceiptConfig}
              onSave={onSaveReceipt}
              saveStatus={saveStatus}
            />
          </Suspense>
        );
      case "backup":
        return (
          <Suspense fallback={<TabLoading />}>
            <BackupSettingsTab
              backupDirectory={backupDirectory}
              setBackupDirectory={setBackupDirectory}
              backups={backups}
              backupLoading={backupLoading}
              restoreLoading={restoreLoading}
              backupProgress={backupProgress}
              backupSchedule={backupSchedule}
              setBackupSchedule={setBackupSchedule}
              onSelectBackupDirectory={onSelectBackupDirectory}
              onCreateBackup={onCreateBackup}
              onSelectBackupFile={onSelectBackupFile}
              onRestoreBackup={onRestoreBackup}
              onDeleteBackup={onDeleteBackup}
              onSave={onSaveBackup}
              saveStatus={saveStatus}
            />
          </Suspense>
        );
      case "hotkeys":
        return (
          <Suspense fallback={<TabLoading />}>
            <HotkeySettings />
          </Suspense>
        );
      case "serial":
        return (
          <Suspense fallback={<TabLoading />}>
            <SerialSettingsTab
              serialInfo={serialInfo}
              newSerialNo={newSerialNo}
              setNewSerialNo={setNewSerialNo}
              serialStatus={serialStatus}
              onActivateSerial={onActivateSerial}
              onDeactivateSerial={onDeactivateSerial}
              onSave={onSaveSerial}
              saveStatus={saveStatus}
            />
          </Suspense>
        );
      case "diagnostics":
        return (
          <Suspense fallback={<TabLoading />}>
            <DiagnosticsTab canApplyIndexes={isAdminModeEnabled()} />
          </Suspense>
        );
      case "experimental":
        return (
          <Suspense fallback={<TabLoading />}>
            <ExperimentalFeaturesTab />
          </Suspense>
        );
      case "about":
        return (
          <Suspense fallback={<TabLoading />}>
            <AboutTab
              appVersion={appVersion}
              onCheckForUpdates={onCheckForUpdates}
              onOpenLogs={onOpenLogs}
              onOpenWebsite={onOpenWebsite}
            />
          </Suspense>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Seçilen sekme bulunamadı</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {tabs.find((tab) => tab.id === activeTab)?.title || "Ayarlar"}
        </h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-2">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div className="md:col-span-3">{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default SettingsPage;