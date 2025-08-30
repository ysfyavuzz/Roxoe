// components/settings/BackupSettingsTab.tsx
import { Database, Download, Upload, Clock, Check, RefreshCw, Calendar } from "lucide-react";
import React from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";

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

interface BackupSettingsTabProps {
  backupDirectory: string;
  setBackupDirectory: (directory: string) => void;
  backups: BackupHistoryItem[];
  backupLoading: boolean;
  restoreLoading: boolean;
  backupProgress: BackupProgress;
  backupSchedule: BackupScheduleConfig;
  setBackupSchedule: (config: BackupScheduleConfig) => void;
  onSelectBackupDirectory: () => void;
  onCreateBackup: () => void;
  onSelectBackupFile: () => void;
  onRestoreBackup: (backupId: string) => void;
  onDeleteBackup: (backupId: string) => void;
  onSave: () => void;
  saveStatus: {
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  };
}

const BackupSettingsTab: React.FC<BackupSettingsTabProps> = React.memo(({
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
  onSave,
  saveStatus,
}) => {
  const handleScheduleChange = (
    key: keyof BackupScheduleConfig,
    value: boolean | 'daily' | 'weekly' | 'monthly' | string | null
  ) => {
    setBackupSchedule({ ...backupSchedule, [key]: value as BackupScheduleConfig[keyof BackupScheduleConfig] });
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) {return '0 B';}
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Yedekleme Dizini */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} />
          <h3 className="text-lg font-semibold">Yedekleme Dizini</h3>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={backupDirectory}
              onChange={(e) => setBackupDirectory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Yedekleme dosyalarının kaydedileceği klasör..."
              readOnly
            />
          </div>
          <Button
            variant="outline"
            onClick={onSelectBackupDirectory}
            className="flex items-center gap-2"
          >
            <Database size={16} />
            Klasör Seç
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Yedekleme dosyalarının kaydedileceği dizini seçin. Yeterli disk alanı olduğundan emin olun.
        </p>
      </Card>

      {/* Otomatik Yedekleme Zamanlaması */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} />
          <h3 className="text-lg font-semibold">Otomatik Yedekleme</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={backupSchedule.enabled}
                onChange={(e) => handleScheduleChange("enabled", e.target.checked)}
                className="form-checkbox"
              />
              <span>Otomatik yedeklemeyi etkinleştir</span>
            </label>
          </div>

          {backupSchedule.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yedekleme Sıklığı
                </label>
                <select
                  value={backupSchedule.frequency}
                  onChange={(e) => handleScheduleChange("frequency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Her Gün</option>
                  <option value="weekly">Haftalık</option>
                  <option value="monthly">Aylık</option>
                </select>
              </div>

              {backupSchedule.lastBackup && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Son Yedekleme:</span> {formatDate(backupSchedule.lastBackup)}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Manuel Yedekleme İşlemleri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Manuel Yedekleme İşlemleri</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onCreateBackup}
            disabled={backupLoading || !backupDirectory}
            className="flex items-center justify-center gap-2 h-12"
          >
            {backupLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Yedekleniyor...
              </>
            ) : (
              <>
                <Download size={16} />
                Yedek Oluştur
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onSelectBackupFile}
            disabled={restoreLoading}
            className="flex items-center justify-center gap-2 h-12"
          >
            {restoreLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Geri Yükleniyor...
              </>
            ) : (
              <>
                <Upload size={16} />
                Yedek Geri Yükle
              </>
            )}
          </Button>
        </div>

        {(backupLoading || restoreLoading) && backupProgress.stage && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">{backupProgress.stage}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${backupProgress.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              %{backupProgress.progress.toFixed(1)}
            </div>
          </div>
        )}
      </Card>

      {/* Yedekleme Geçmişi */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Yedekleme Geçmişi</h3>
        
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database size={48} className="mx-auto mb-4 opacity-50" />
            <p>Henüz yedekleme yapılmamış</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">{backup.filename}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(backup.createdAt)} • {backup.totalRecords.toLocaleString()} kayıt
                  </div>
                  {backup.description && (
                    <div className="text-xs text-gray-400 mt-1">{backup.description}</div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestoreBackup(backup.id)}
                    disabled={restoreLoading || backupLoading}
                    className="flex items-center gap-1"
                  >
                    <Upload size={14} />
                    Geri Yükle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteBackup(backup.id)}
                    disabled={restoreLoading || backupLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Yedekleme Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Yedekleme Bilgileri</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Yedeklenen Veriler:</strong> Tüm ürünler, satışlar, müşteriler, kasa işlemleri</p>
          <p><strong>Dosya Formatı:</strong> JSON (sıkıştırılmış)</p>
          <p><strong>Güvenlik:</strong> Veriler şifrelenerek saklanır</p>
          <p><strong>Öneri:</strong> Düzenli yedekleme yapın ve farklı konumlarda saklayın</p>
        </div>
      </Card>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={saveStatus.status === "saving"}
          className="flex items-center gap-2 min-w-[120px]"
        >
          {saveStatus.status === "saving" ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Check size={16} />
              Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

BackupSettingsTab.displayName = "BackupSettingsTab";

export default BackupSettingsTab;