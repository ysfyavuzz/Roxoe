// components/settings/POSSettingsTab.tsx
import React from "react";
import { Printer, Check, RefreshCw } from "lucide-react";
import { POSConfig, SerialOptions } from "../../types/pos";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface POSSettingsTabProps {
  posConfig: POSConfig;
  setPosConfig: (config: POSConfig) => void;
  serialOptions: SerialOptions;
  setSerialOptions: (options: SerialOptions) => void;
  connectionStatus: "connected" | "disconnected" | "unknown";
  onTestConnection: () => void;
  onSave: () => void;
  saveStatus: {
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  };
}

const POSSettingsTab: React.FC<POSSettingsTabProps> = React.memo(({
  posConfig,
  setPosConfig,
  serialOptions,
  setSerialOptions,
  connectionStatus,
  onTestConnection,
  onSave,
  saveStatus,
}) => {
  const handlePOSTypeChange = (type: POSConfig["type"]) => {
    setPosConfig({ ...posConfig, type });
  };

  const handleProtocolChange = (protocol: POSConfig["protocol"]) => {
    setPosConfig({ ...posConfig, protocol });
  };

  const handleBaudRateChange = (baudRate: number) => {
    setPosConfig({ ...posConfig, baudRate });
    setSerialOptions({ ...serialOptions, baudRate });
  };

  const handleManualModeChange = (manualMode: boolean) => {
    setPosConfig({ ...posConfig, manualMode });
  };

  const handleCommandChange = (command: keyof POSConfig["commandSet"], value: string) => {
    setPosConfig({
      ...posConfig,
      commandSet: { ...posConfig.commandSet, [command]: value },
    });
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Bağlı";
      case "disconnected":
        return "Bağlantısız";
      default:
        return "Bilinmiyor";
    }
  };

  return (
    <div className="space-y-6">
      {/* POS Cihazı Tipi */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Printer size={20} />
          <h3 className="text-lg font-semibold">POS Cihazı Tipi</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {["Ingenico", "Verifone", "PAX", "Diğer"].map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="posType"
                value={type}
                checked={posConfig.type === type}
                onChange={(e) => handlePOSTypeChange(e.target.value as POSConfig["type"])}
                className="form-radio"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Protokol Ayarları */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Protokol Ayarları</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {["OPOS", "DirectIO", "Custom"].map((protocol) => (
            <label key={protocol} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="protocol"
                value={protocol}
                checked={posConfig.protocol === protocol}
                onChange={(e) => handleProtocolChange(e.target.value as POSConfig["protocol"])}
                className="form-radio"
              />
              <span>{protocol}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Baud Rate
          </label>
          <select
            value={posConfig.baudRate}
            onChange={(e) => handleBaudRateChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={9600}>9600</option>
            <option value={19200}>19200</option>
            <option value={38400}>38400</option>
            <option value={57600}>57600</option>
            <option value={115200}>115200</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={posConfig.manualMode}
              onChange={(e) => handleManualModeChange(e.target.checked)}
              className="form-checkbox"
            />
            <span>Manuel Mod (POS cihazı olmadan test)</span>
          </label>
        </div>
      </Card>

      {/* Komut Setleri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Komut Setleri</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ödeme Komutu
            </label>
            <input
              type="text"
              value={posConfig.commandSet.payment}
              onChange={(e) => handleCommandChange("payment", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: 0x02payment0x03"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İptal Komutu
            </label>
            <input
              type="text"
              value={posConfig.commandSet.cancel}
              onChange={(e) => handleCommandChange("cancel", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: 0x02cancel0x03"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum Komutu
            </label>
            <input
              type="text"
              value={posConfig.commandSet.status}
              onChange={(e) => handleCommandChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: 0x02status0x03"
            />
          </div>
        </div>
      </Card>

      {/* Bağlantı Durumu ve Test */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bağlantı Durumu</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === "connected" ? "bg-green-500" : 
              connectionStatus === "disconnected" ? "bg-red-500" : "bg-gray-400"
            }`} />
            <span className={getConnectionStatusColor()}>
              {getConnectionStatusText()}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={onTestConnection}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Bağlantıyı Test Et
          </Button>
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

POSSettingsTab.displayName = "POSSettingsTab";

export default POSSettingsTab;