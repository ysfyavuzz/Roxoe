import { describe, it } from "vitest";

// Not: Hook testleri için renderHook (RTL) ve servis mock'ları gerekecek.
// Bu iskelet test, ileride gerçek mock'larla doldurulacaktır.

describe("useCashRegisterPage", () => {
  it.skip("aktif oturumu yüklemeli ve temel aksiyonları çalıştırmalı", async () => {
    // arrange: mock cashRegisterService.getActiveSession / getSessionDetails
    // act: hook'u çağır, handleOpenRegister/handleCashDeposit/handleCloseDay vb.
    // assert: state güncellemeleri ve etkileşimler
  });
});

