// components/settings/BarcodeSettingsTab.tsx
import { Barcode, Check, RefreshCw } from "lucide-react";
import React from "react";

import { BarcodeConfig } from "../../types/barcode";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface BarcodeSettingsTabProps {
  barcodeConfig: BarcodeConfig;
  setBarcodeConfig: (config: BarcodeConfig) => void;
  onSave: () => void;
  saveStatus: {
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  };
}

const BarcodeSettingsTab: React.FC<BarcodeSettingsTabProps> = React.memo(({
  barcodeConfig,
  setBarcodeConfig,
  onSave,
  saveStatus,
}) => {
  const handleConfigChange = (
    key: keyof BarcodeConfig,
    value: string | number | boolean
  ) => {
    setBarcodeConfig({ ...barcodeConfig, [key]: value } as BarcodeConfig);
  };

  return (
    <div className="space-y-6">
      {/* Barkod Okuyucu Tipi */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Barcode size={20} />
          <h3 className="text-lg font-semibold">Barkod Okuyucu Tipi</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {["USB HID", "Serial", "USB Serial", "Ethernet"].map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="barcodeType"
                value={type}
                checked={barcodeConfig.type === type}
                onChange={(e) => handleConfigChange("type", e.target.value)}
                className="form-radio"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Barkod Okuyucu Ayarları */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Okuyucu Ayarları</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={barcodeConfig.enabled}
                onChange={(e) => handleConfigChange("enabled", e.target.checked)}
                className="form-checkbox"
              />
              <span>Barkod okuyucuyu etkinleştir</span>
            </label>
          </div>

          {barcodeConfig.type === "Serial" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baud Rate
              </label>
              <select
                value={barcodeConfig.baudRate}
                onChange={(e) => handleConfigChange("baudRate", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={9600}>9600</option>
                <option value={19200}>19200</option>
                <option value={38400}>38400</option>
                <option value={57600}>57600</option>
                <option value={115200}>115200</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prefix (Önek)
            </label>
            <input
              type="text"
              value={barcodeConfig.prefix}
              onChange={(e) => handleConfigChange("prefix", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: STX, 0x02"
            />
            <p className="text-xs text-gray-500 mt-1">
              Barkod verisi başında gönderilecek karakter(ler)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suffix (Sonek)
            </label>
            <input
              type="text"
              value={barcodeConfig.suffix}
              onChange={(e) => handleConfigChange("suffix", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: CR, LF, \n"
            />
            <p className="text-xs text-gray-500 mt-1">
              Barkod verisi sonunda gönderilecek karakter(ler)
            </p>
          </div>
        </div>
      </Card>

      {/* Test Alanı */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Test Alanı</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Barkod okuyucunuzu test etmek için aşağıdaki alana odaklanın ve bir barkod okutun:
          </p>
          <input
            type="text"
            placeholder="Barkod test alanı..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Yardım Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Yardım ve İpuçları</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>USB HID:</strong> En yaygın tip. Klavye gibi çalışır, ek sürücü gerektirmez.</p>
          <p><strong>Serial:</strong> COM portu üzerinden bağlanır. Baud rate ayarı önemlidir.</p>
          <p><strong>USB Serial:</strong> USB port üzerinden serial iletişim.</p>
          <p><strong>Ethernet:</strong> Ağ üzerinden bağlantı (IP adresi gerekir).</p>
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

BarcodeSettingsTab.displayName = "BarcodeSettingsTab";

export default BarcodeSettingsTab;