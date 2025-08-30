// components/settings/SerialSettingsTab.tsx
import { Key, Check, RefreshCw, Shield, Info } from "lucide-react";
import React from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";

interface SerialInfo {
  serialNo: string;
  activatedAt: string;
  isActive: boolean;
  machineId: string;
}

interface SerialSettingsTabProps {
  serialInfo: SerialInfo | null;
  newSerialNo: string;
  setNewSerialNo: (serialNo: string) => void;
  serialStatus: {
    loading: boolean;
    error: string | null;
  };
  onActivateSerial: () => void;
  onDeactivateSerial: () => void;
  onSave: () => void;
  saveStatus: {
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  };
}

const SerialSettingsTab: React.FC<SerialSettingsTabProps> = React.memo(({
  serialInfo,
  newSerialNo,
  setNewSerialNo,
  serialStatus,
  onActivateSerial,
  onDeactivateSerial,
  onSave,
  saveStatus,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const formatSerialNo = (serialNo: string): string => {
    // Serial numarayı ****-****-**** formatında göster
    if (serialNo.length >= 12) {
      return `${serialNo.substring(0, 4)}-${serialNo.substring(4, 8)}-${serialNo.substring(8, 12)}`;
    }
    return serialNo;
  };

  return (
    <div className="space-y-6">
      {/* Mevcut Serial Bilgileri */}
      {serialInfo && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className={serialInfo.isActive ? "text-green-600" : "text-red-600"} />
            <h3 className="text-lg font-semibold">Mevcut Serial Bilgileri</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              serialInfo.isActive 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {serialInfo.isActive ? "Aktif" : "Pasif"}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Numarası
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono">
                {formatSerialNo(serialInfo.serialNo)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktivasyon Tarihi
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                {formatDate(serialInfo.activatedAt)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Makine ID
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-xs">
                {serialInfo.machineId}
              </div>
            </div>

            <div className="flex items-end">
              {serialInfo.isActive ? (
                <Button
                  variant="outline"
                  onClick={onDeactivateSerial}
                  disabled={serialStatus.loading}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {serialStatus.loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin mr-2" />
                      Deaktive Ediliyor...
                    </>
                  ) : (
                    "Deaktive Et"
                  )}
                </Button>
              ) : (
                <div className="w-full text-center text-sm text-red-600">
                  Serial numarası aktif değil
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Yeni Serial Aktivasyonu */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key size={20} />
          <h3 className="text-lg font-semibold">
            {serialInfo ? "Serial Değiştir" : "Serial Aktivasyonu"}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Serial Numarası
            </label>
            <input
              type="text"
              value={newSerialNo}
              onChange={(e) => setNewSerialNo(e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="XXXX-XXXX-XXXX"
              maxLength={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              12 haneli serial numaranızı girin (harfler ve rakamlar)
            </p>
          </div>

          {serialStatus.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-600 text-sm">{serialStatus.error}</div>
            </div>
          )}

          <Button
            onClick={onActivateSerial}
            disabled={!newSerialNo || newSerialNo.length < 12 || serialStatus.loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {serialStatus.loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Aktivasyon yapılıyor...
              </>
            ) : (
              <>
                <Check size={16} />
                Serial Aktive Et
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Serial Hakkında Bilgi */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={20} />
          <h3 className="text-lg font-semibold">Serial Aktivasyonu Hakkında</h3>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Serial Numarası Nedir?</strong> RoxoePOS yazılımını kullanabilmek için 
            gerekli olan 12 haneli lisans kodudur.
          </p>
          
          <p>
            <strong>Nasıl Edinilir?</strong> Serial numaranızı satın alma işlemi sırasında 
            e-posta ile alırsınız veya müşteri temsilcinizden temin edebilirsiniz.
          </p>
          
          <p>
            <strong>Güvenlik:</strong> Her serial numara yalnızca bir makine ile eşleştirilir. 
            Bu sayede yazılımınızın güvenliği sağlanır.
          </p>
          
          <p>
            <strong>Değişiklik:</strong> Makine değişikliği durumunda yeni serial 
            aktivasyonu yapabilirsiniz. Eski serial otomatik olarak deaktive edilir.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
            <div className="text-yellow-800 text-sm">
              <strong>Önemli:</strong> Serial numaranızı güvenli bir yerde saklayın. 
              Sistem yeniden kurulumu durumunda tekrar ihtiyaç duyacaksınız.
            </div>
          </div>
        </div>
      </Card>

      {/* Destek İletişim */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Destek İletişim</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Serial sorunları için:</strong></p>
          <p>📧 E-posta: destek@roxoepos.com</p>
          <p>📞 Telefon: 0850 XXX XX XX</p>
          <p>🕒 Çalışma Saatleri: Pazartesi-Cuma 09:00-18:00</p>
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

SerialSettingsTab.displayName = "SerialSettingsTab";

export default SerialSettingsTab;