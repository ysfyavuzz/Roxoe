import { useEffect, useState } from "react";

interface ViewPrefs {
  compactCartView: boolean;
  setCompactCartView: (v: boolean) => void;
  compactProductView: boolean;
  setCompactProductView: (v: boolean) => void;
  showProductImages: boolean;
  setShowProductImages: (v: boolean) => void;
}

/**
 * POS görünüm tercihleri (kompakt sepet ve kompakt ürün listesi) için
 * localStorage kalıcılığı sağlayan yardımcı hook.
 */
export function usePOSViewPreferences(): ViewPrefs {
  const [compactCartView, _setCompactCartView] = useState<boolean>(() => {
    const saved = localStorage.getItem("compactCartView");
    return saved ? JSON.parse(saved) === true : false;
  });

  const [compactProductView, _setCompactProductView] = useState<boolean>(() => {
    const saved = localStorage.getItem("compactProductView");
    return saved ? JSON.parse(saved) === true : false;
  });

  // Ürün görsellerini göster/gizle tercihi
  const [showProductImages, _setShowProductImages] = useState<boolean>(() => {
    const saved = localStorage.getItem("showProductImages");
    // Varsayılan: true (görseller açılsın)
    return saved ? JSON.parse(saved) !== false : true;
  });

  // Synchronous setters that also persist immediately to localStorage
  const setCompactCartView = (v: boolean) => {
    _setCompactCartView(v);
    try {
      localStorage.setItem("compactCartView", JSON.stringify(v));
    } catch {
      // no-op in tests or restricted environments
    }
  };

  const setCompactProductView = (v: boolean) => {
    _setCompactProductView(v);
    try {
      localStorage.setItem("compactProductView", JSON.stringify(v));
    } catch {
      // no-op
    }
  };

  const setShowProductImages = (v: boolean) => {
    _setShowProductImages(v);
    try {
      localStorage.setItem("showProductImages", JSON.stringify(v));
    } catch {
      // no-op
    }
  };

  // Keep effects as a safety net if internal state changes via other paths
  useEffect(() => {
    localStorage.setItem("compactCartView", JSON.stringify(compactCartView));
  }, [compactCartView]);

  useEffect(() => {
    localStorage.setItem("compactProductView", JSON.stringify(compactProductView));
  }, [compactProductView]);

  useEffect(() => {
    localStorage.setItem("showProductImages", JSON.stringify(showProductImages));
  }, [showProductImages]);

  return {
    compactCartView,
    setCompactCartView,
    compactProductView,
    setCompactProductView,
    showProductImages,
    setShowProductImages,
  };
}

