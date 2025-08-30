import { useCallback, useEffect, useState } from "react";

import { cashRegisterService } from "../services/cashRegisterDB";
import type { CashRegisterSession } from "../types/cashRegister";

export type UseRegisterStatusOptions = {
  autoRefresh?: boolean;
  onError?: (err: unknown) => void;
};

export type UseRegisterStatusResult = {
  isOpen: boolean;
  loading: boolean;
  error: unknown;
  session: CashRegisterSession | null;
  refresh: () => Promise<void>;
  open: (openingBalance: number) => Promise<CashRegisterSession>;
  close: () => Promise<CashRegisterSession>;
};

export function useRegisterStatus(
  options: UseRegisterStatusOptions = {}
): UseRegisterStatusResult {
  const { autoRefresh = true, onError } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<CashRegisterSession | null>(null);
  const [loading, setLoading] = useState<boolean>(autoRefresh);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const active = await cashRegisterService.getActiveSession();
      setSession(active ?? null);
      setIsOpen(!!active);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const open = useCallback(async (openingBalance: number) => {
    try {
      const newSession = await cashRegisterService.openRegister(openingBalance);
      await refresh();
      return newSession;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    }
  }, [refresh, onError]);

  const close = useCallback(async () => {
    try {
      // En güncel aktif oturumu çek ve kapat
      const active = await cashRegisterService.getActiveSession();
      if (!active) {
        throw new Error("Kapatılacak aktif bir kasa oturumu bulunamadı.");
      }
      const closed = await cashRegisterService.closeRegister(active.id);
      await refresh();
      return closed;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    }
  }, [refresh, onError]);

  useEffect(() => {
    if (autoRefresh) {
      void refresh();
    }
  }, [autoRefresh, refresh]);

  return { isOpen, loading, error, session, refresh, open, close };
}

