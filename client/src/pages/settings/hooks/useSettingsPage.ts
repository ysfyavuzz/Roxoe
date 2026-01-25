// pages/settings/hooks/useSettingsPage.ts
import { useState, useCallback } from "react";

import { useAlert } from "../../../components/AlertProvider";
import { BarcodeConfig } from "../../../types/barcode";
import { POSConfig, SerialOptions } from "../../../types/pos";
import { ReceiptConfig } from "../../../types/receipt";

export type ConnectionStatus = "connected" | "disconnected" | "unknown";

interface BackupHistoryItem {
  id: string;
  filename: string;
  description: string;
  createdAt: string;
  databases: string[];
  totalRecords: number;
}

interface BackupProgress {
  stage: string;
  progress: number;
}

interface BackupScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  lastBackup: string | null;
}

interface SerialInfo {
  serialNo: string;
  activatedAt: string;
  isActive: boolean;
  machineId: string;
}

interface SaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  message: string;
}

const useSettingsPage = () => {
  const { showSuccess, showError, showInfo, confirm } = useAlert();

  // App metadata
  const [appVersion] = useState<string>("0.5.3");

  // POS state
  const [posConfig, setPosConfig] = useState<POSConfig>({
    type: "Ingenico",
    baudRate: 9600,
    protocol: "OPOS",
    manualMode: false,
    commandSet: {
      payment: "PAY",
      cancel: "CANCEL",
      status: "STATUS",
    },
  });
  const [serialOptions, setSerialOptions] = useState<SerialOptions>({ baudRate: 9600 });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("unknown");

  const onTestConnection = useCallback(() => {
    setConnectionStatus("connected");
    showSuccess("POS bağlantısı başarılı");
  }, [showSuccess]);

  // Barcode state
  const [barcodeConfig, setBarcodeConfig] = useState<BarcodeConfig>({
    type: "USB HID",
    baudRate: 9600,
    enabled: true,
    prefix: "",
    suffix: "",
  });

  // Receipt state
  const [receiptConfig, setReceiptConfig] = useState<ReceiptConfig>({
    storeName: "",
    legalName: "",
    address: ["", ""],
    phone: "",
    taxOffice: "",
    taxNumber: "",
    mersisNo: "",
    footer: {
      message: "",
      returnPolicy: "",
    },
  });

  // Backup state
  const [backupDirectory, setBackupDirectory] = useState<string>("");
  const [backups, setBackups] = useState<BackupHistoryItem[]>([]);
  const [backupLoading, setBackupLoading] = useState<boolean>(false);
  const [restoreLoading, setRestoreLoading] = useState<boolean>(false);
  const [backupProgress, setBackupProgress] = useState<BackupProgress>({ stage: "", progress: 0 });
  const [backupSchedule, setBackupSchedule] = useState<BackupScheduleConfig>({
    enabled: false,
    frequency: "weekly",
    lastBackup: null,
  });

  const onSelectBackupDirectory = useCallback(() => {
    // Placeholder: In production, use OS/Electron file dialog
    const defaultDir = "C:\\RoxoePOS\\Backups";
    setBackupDirectory(defaultDir);
    showSuccess(`Yedekleme dizini ayarlandı: ${defaultDir}`);
  }, [showSuccess]);

  const onCreateBackup = useCallback(() => {
    if (!backupDirectory) {
      showError("Lütfen önce yedekleme dizini seçin");
      return;
    }

    setBackupLoading(true);
    setBackupProgress({ stage: "Veriler toplanıyor", progress: 100 });

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newBackup: BackupHistoryItem = {
      id,
      filename: `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
      description: "Tam yedek",
      createdAt: now,
      databases: ["products", "sales", "customers", "cash"],
      totalRecords: Math.floor(Math.random() * 10000) + 500, // Simulation data
    };
    setBackups((prev) => [newBackup, ...prev]);
    setBackupSchedule((prev) => ({ ...prev, lastBackup: now }));

    setBackupLoading(false);
    setBackupProgress({ stage: "", progress: 0 });
    showSuccess("Yedekleme tamamlandı");
  }, [backupDirectory, showError, showSuccess]);

  const onSelectBackupFile = useCallback(() => {
    showInfo("Yedek dosyası seçimi bu ortamda devre dışıdır");
  }, [showInfo]);

  const onRestoreBackup = useCallback(
    async (backupId: string) => {
      const backup = backups.find((b) => b.id === backupId);
      if (!backup) {
        showError("Yedek bulunamadı");
        return;
      }

const ok = await confirm(`"${backup.filename}" geri yüklensin mi?`);
      if (!ok) {return;}

      setRestoreLoading(true);
      setBackupProgress({ stage: "Yedek geri yükleniyor", progress: 100 });

      setRestoreLoading(false);
      setBackupProgress({ stage: "", progress: 0 });
      showSuccess("Geri yükleme tamamlandı");
    },
    [backups, confirm, showError, showSuccess]
  );

  const onDeleteBackup = useCallback(
    async (backupId: string) => {
      const backup = backups.find((b) => b.id === backupId);
      if (!backup) {return;}
const ok = await confirm(`"${backup.filename}" silinsin mi?`);
      if (!ok) {return;}
      setBackups((prev) => prev.filter((b) => b.id !== backupId));
      showSuccess("Yedek silindi");
    },
    [backups, confirm, showSuccess]
  );

  // Serial state
  const [serialInfo, setSerialInfo] = useState<SerialInfo | null>(null);
  const [newSerialNo, setNewSerialNo] = useState<string>("");
  const [serialStatus, setSerialStatus] = useState<{ loading: boolean; error: string | null }>({
    loading: false,
    error: null,
  });

  const onActivateSerial = useCallback(() => {
    if (!newSerialNo || newSerialNo.length < 12) {
      setSerialStatus({ loading: false, error: "Geçerli bir 12 haneli serial numarası girin" });
      return;
    }

    setSerialStatus({ loading: true, error: null });
    const now = new Date().toISOString();
    setSerialInfo({
      serialNo: newSerialNo,
      activatedAt: now,
      isActive: true,
      machineId: (() => {
        type NavHC = Navigator & { hardwareConcurrency?: number };
        const hc = (navigator as unknown as NavHC).hardwareConcurrency;
        return hc ? `MCH-${hc}` : "MCH-UNKNOWN";
      })(),
    });
    setNewSerialNo("");
    setSerialStatus({ loading: false, error: null });
    showSuccess("Serial aktive edildi");
  }, [newSerialNo, showSuccess]);

  const onDeactivateSerial = useCallback(() => {
    if (!serialInfo) {return;}
    setSerialStatus({ loading: true, error: null });
    setSerialInfo({ ...serialInfo, isActive: false });
    setSerialStatus({ loading: false, error: null });
    showSuccess("Serial deaktive edildi");
  }, [serialInfo, showSuccess]);

  // Save status and actions
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: "idle", message: "" });

  const performSave = useCallback(
    (area: string) => {
      setSaveStatus({ status: "saving", message: "" });
      // Simulate immediate save
      setSaveStatus({ status: "saved", message: `${area} ayarları kaydedildi` });
      showSuccess(`${area} ayarları kaydedildi`);
    },
    [showSuccess]
  );

  const onSavePOS = useCallback(() => performSave("POS"), [performSave]);
  const onSaveBarcode = useCallback(() => performSave("Barkod"), [performSave]);
  const onSaveReceipt = useCallback(() => performSave("Fiş ve İşletme"), [performSave]);
  const onSaveBackup = useCallback(() => performSave("Yedekleme"), [performSave]);
  const onSaveSerial = useCallback(() => performSave("Serial"), [performSave]);

  // About handlers
  const onCheckForUpdates = useCallback(() => {
    showInfo("Güncelleme kontrolü simülasyonu");
  }, [showInfo]);

  const onOpenLogs = useCallback(() => {
    showInfo("Log dosyaları bu ortamda açılamıyor");
  }, [showInfo]);

  const onOpenWebsite = useCallback(() => {
    try {
      window.open("https://www.roxoepos.com", "_blank");
    } catch {
      showInfo("Web sitesi açılamadı");
    }
  }, [showInfo]);

  return {
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
    // Save
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
  };
};

export default useSettingsPage;

