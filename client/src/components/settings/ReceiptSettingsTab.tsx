// components/settings/ReceiptSettingsTab.tsx
import React from "react";
import { Building, Check, RefreshCw } from "lucide-react";
import { ReceiptConfig } from "../../types/receipt";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface ReceiptSettingsTabProps {
  receiptConfig: ReceiptConfig;
  setReceiptConfig: (config: ReceiptConfig) => void;
  onSave: () => void;
  saveStatus: {
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  };
}

const ReceiptSettingsTab: React.FC<ReceiptSettingsTabProps> = React.memo(({
  receiptConfig,
  setReceiptConfig,
  onSave,
  saveStatus,
}) => {
  const handleConfigChange = (key: keyof ReceiptConfig, value: any) => {
    setReceiptConfig({ ...receiptConfig, [key]: value });
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddress = [...receiptConfig.address];
    newAddress[index] = value;
    setReceiptConfig({ ...receiptConfig, address: newAddress });
  };

  const handleFooterChange = (key: keyof ReceiptConfig["footer"], value: string) => {
    setReceiptConfig({
      ...receiptConfig,
      footer: { ...receiptConfig.footer, [key]: value }
    });
  };

  return (
    <div className="space-y-6">
      {/* İşletme Bilgileri */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building size={20} />
          <h3 className="text-lg font-semibold">İşletme Bilgileri</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mağaza Adı *
            </label>
            <input
              type="text"
              value={receiptConfig.storeName}
              onChange={(e) => handleConfigChange("storeName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: ABC Market"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yasal Ünvan
            </label>
            <input
              type="text"
              value={receiptConfig.legalName}
              onChange={(e) => handleConfigChange("legalName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: ABC Ticaret Ltd. Şti."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={receiptConfig.phone}
              onChange={(e) => handleConfigChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: 0212 555 0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vergi Dairesi
            </label>
            <input
              type="text"
              value={receiptConfig.taxOffice}
              onChange={(e) => handleConfigChange("taxOffice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: Kadıköy V.D."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vergi Numarası
            </label>
            <input
              type="text"
              value={receiptConfig.taxNumber}
              onChange={(e) => handleConfigChange("taxNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: 1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MERSİS Numarası
            </label>
            <input
              type="text"
              value={receiptConfig.mersisNo}
              onChange={(e) => handleConfigChange("mersisNo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: 0123456789012345"
            />
          </div>
        </div>
      </Card>

      {/* Adres Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Adres Bilgileri</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres Satır 1
            </label>
            <input
              type="text"
              value={receiptConfig.address[0] || ""}
              onChange={(e) => handleAddressChange(0, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: Atatürk Cad. No:123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres Satır 2
            </label>
            <input
              type="text"
              value={receiptConfig.address[1] || ""}
              onChange={(e) => handleAddressChange(1, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: Kadıköy / İstanbul"
            />
          </div>
        </div>
      </Card>

      {/* Fiş Alt Bilgi */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Fiş Alt Bilgileri</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teşekkür Mesajı
            </label>
            <input
              type="text"
              value={receiptConfig.footer.message}
              onChange={(e) => handleFooterChange("message", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: Bizi tercih ettiğiniz için teşekkür ederiz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İade Politikası
            </label>
            <textarea
              value={receiptConfig.footer.returnPolicy}
              onChange={(e) => handleFooterChange("returnPolicy", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örnek: Ürün iade ve değişimlerinde bu fiş ve ambalaj gereklidir"
            />
          </div>
        </div>
      </Card>

      {/* Fiş Önizleme */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Fiş Önizleme</h3>
        
        <div className="bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg font-mono text-sm">
          <div className="text-center">
            <div className="font-bold">{receiptConfig.storeName || "MAĞAZA ADI"}</div>
            {receiptConfig.legalName && <div>{receiptConfig.legalName}</div>}
            <div>{receiptConfig.address[0] || "ADRES SATIR 1"}</div>
            <div>{receiptConfig.address[1] || "ADRES SATIR 2"}</div>
            {receiptConfig.phone && <div>Tel: {receiptConfig.phone}</div>}
            {receiptConfig.taxOffice && receiptConfig.taxNumber && (
              <div>{receiptConfig.taxOffice} VKN: {receiptConfig.taxNumber}</div>
            )}
            {receiptConfig.mersisNo && <div>MERSİS: {receiptConfig.mersisNo}</div>}
          </div>
          
          <div className="my-4 border-t border-dashed border-gray-400"></div>
          
          <div className="text-center">
            <div>{new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR')}</div>
            <div>FİŞ NO: #12345</div>
          </div>
          
          <div className="my-4 border-t border-dashed border-gray-400"></div>
          
          <div>
            <div className="flex justify-between">
              <span>ÜRÜN ÖRNEĞİ</span>
              <span>10,00 TL</span>
            </div>
            <div className="text-right text-xs text-gray-500">1 x 10,00</div>
          </div>
          
          <div className="my-2 border-t border-dashed border-gray-400"></div>
          
          <div className="flex justify-between font-bold">
            <span>TOPLAM:</span>
            <span>10,00 TL</span>
          </div>
          
          <div className="my-4 border-t border-dashed border-gray-400"></div>
          
          <div className="text-center text-xs">
            <div>{receiptConfig.footer.message}</div>
            <div className="mt-2">{receiptConfig.footer.returnPolicy}</div>
          </div>
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

ReceiptSettingsTab.displayName = "ReceiptSettingsTab";

export default ReceiptSettingsTab;