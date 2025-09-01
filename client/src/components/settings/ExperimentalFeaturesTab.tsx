import React, { useCallback } from "react";

import { setFlag } from "../../config/featureFlags";
import { useFeatureFlag } from "../../hooks/useFeatureFlag";
import Card from "../ui/Card";

const ExperimentalFeaturesTab: React.FC = () => {
  const registerRecovery = useFeatureFlag("registerRecovery");
  const escposDrawer = useFeatureFlag("escposDrawer");

  const persist = (key: "registerRecovery" | "escposDrawer", value: boolean) => {
    try {
      localStorage.setItem(`featureFlags.${key}`, String(value));
    } catch {
      /* ignore */ void 0;
    }
  };

  const onToggleRegisterRecovery = useCallback(() => {
    const next = !registerRecovery;
    setFlag("registerRecovery", next);
    persist("registerRecovery", next);
  }, [registerRecovery]);

  const onToggleEscposDrawer = useCallback(() => {
    const next = !escposDrawer;
    setFlag("escposDrawer", next);
    persist("escposDrawer", next);
  }, [escposDrawer]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Deneysel Özellikler</h3>
        <p className="text-sm text-gray-600 mb-4">
          Bu bölümdeki özellikler deneyseldir. Üretim ortamında dikkatli kullanın.
        </p>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">Kasa Kurtarma Modu</div>
              <div className="text-sm text-gray-600">
                Açık kasa oturumu tespit edilirse, otomatik olarak kapatıp yeni oturumu açmayı öner.
              </div>
            </div>
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5"
              checked={registerRecovery}
              onChange={onToggleRegisterRecovery}
              aria-label="Kasa Kurtarma Modu"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">ESC/POS Çekmece Entegrasyonu</div>
              <div className="text-sm text-gray-600">
                Yazıcı/çekmece kontrolünü etkinleştir (uyumlu cihazlarda).
              </div>
            </div>
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5"
              checked={escposDrawer}
              onChange={onToggleEscposDrawer}
              aria-label="ESC/POS Çekmece"
            />
          </label>
        </div>
      </Card>
    </div>
  );
};

export default ExperimentalFeaturesTab;
