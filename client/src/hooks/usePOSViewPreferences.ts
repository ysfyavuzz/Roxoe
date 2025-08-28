import { useEffect, useState } from "react";

interface ViewPrefs {
  compactCartView: boolean;
  setCompactCartView: (v: boolean) => void;
  compactProductView: boolean;
  setCompactProductView: (v: boolean) => void;
}

/**
 * POS görünüm tercihleri (kompakt sepet ve kompakt ürün listesi) için
 * localStorage kalıcılığı sağlayan yardımcı hook.
 */
export function usePOSViewPreferences(): ViewPrefs {
  const [compactCartView, setCompactCartView] = useState<boolean>(() => {
    const saved = localStorage.getItem("compactCartView");
    return saved ? JSON.parse(saved) === true : false;
  });

  const [compactProductView, setCompactProductView] = useState<boolean>(() => {
    const saved = localStorage.getItem("compactProductView");
    return saved ? JSON.parse(saved) === true : false;
  });

  useEffect(() => {
    localStorage.setItem("compactCartView", JSON.stringify(compactCartView));
  }, [compactCartView]);

  useEffect(() => {
    localStorage.setItem("compactProductView", JSON.stringify(compactProductView));
  }, [compactProductView]);

  return {
    compactCartView,
    setCompactCartView,
    compactProductView,
    setCompactProductView,
  };
}

