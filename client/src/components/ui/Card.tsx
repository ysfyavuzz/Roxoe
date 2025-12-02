import clsx from "clsx";
import {
  AlertTriangle,
  Tag,
  Plus,
  Minus,
  Image,
  ShoppingCart,
  Percent,
} from "lucide-react";
import React from "react";

import { getProductImagePath } from "../../utils/image-path";

export type CardVariant =
  | "default"
  | "stat"
  | "shadow"
  | "bordered"
  | "product"
  | "addProduct"
  | "summary"; // Yeni varyant

export interface CardProps {
  /** Kart tipi */
  variant?: CardVariant;
  /** Başlık metni (ürün adı vb.) */
  title?: string;
  /** Özet değer (istatistik kartlarında) */
  value?: string | number;
  /** Açıklama metni */
  description?: string;
  /** Trend yüzdesi */
  trend?: number;
  /** Trend etiketi */
  trendLabel?: string;
  /** Sol üst ikon vb. */
  icon?: React.ReactNode;
  /** Renk teması */
  color?:
    | "primary"
    | "red"
    | "green"
    | "blue"
    | "orange"
    | "gray"
    | "indigo"
    | "purple";
  /** Ürün görseli için açık URL (varsa önceliklidir) */
  imageUrl?: string;
  /** Ürün görseli tamamen gizlensin mi? */
  hideImage?: boolean;
  /** Ürün barkodu (fallback yol üretimi için kullanılır) */
  barcode?: string;
  /** Görsel yerleşimi (contain: kırpma yapmaz, cover: alanı doldurur) */
  objectFit?: "contain" | "cover";
  /** Ürün kategorisi etiketi */
  category?: string;
  /** Fiyat metni */
  price?: string;
  /** KDV oranı metni (opsiyonel) */
  vatRate?: string;
  /** Stok adedi */
  stock?: number;
  /** Kart tıklama olayı */
  onClick?: () => void;
  /** Devre dışı durumu */
  disabled?: boolean;
  /** Ek sınıflar */
  className?: string;
  /** Gruba ekleme aksiyonu */
  onAddToGroup?: () => void;
  /** Gruptan çıkarma aksiyonu */
  onRemoveFromGroup?: () => void;
  /** Kart boyutu */
  size?: "normal" | "small";
  /** İçerik */
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = "default",
  title,
  value,
  description,
  trend,
  trendLabel,
  icon,
  color = "primary",
  imageUrl,
  hideImage,
  barcode,
  objectFit = "contain",
  category,
  price,
  vatRate,
  stock,
  onClick,
  disabled,
  className,
  onAddToGroup,
  onRemoveFromGroup,
  size = "normal",
  children,
}) => {
  // State to track image load failure
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);

  // Reset image load failure state when image source changes
  React.useEffect(() => {
    setImageLoadFailed(false);
  }, [imageUrl, barcode]);
  // === SUMMARY VARYANTI ===
  if (variant === "summary") {
    const themeClass = {
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
      },
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-700",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-700",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-700",
      },
      red: {
        bg: "bg-red-50",
        text: "text-red-700",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-700",
      },
      gray: {
        bg: "bg-gray-100",
        text: "text-gray-700",
      },
      primary: {
        bg: "bg-primary-50",
        text: "text-primary-700",
      },
    }[color || "indigo"];

    return (
      <div
        className={clsx(
          "bg-white rounded-lg shadow-sm overflow-hidden",
          className
        )}
      >
        <div className={`px-5 py-3 ${themeClass.bg}`}>
          <h3 className={`text-sm font-medium ${themeClass.text}`}>{title}</h3>
        </div>
        <div className="px-5 py-3">
          <div
            className="text-xl font-semibold text-gray-800"
            title={String(value)}
          >
            {value}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  }

  // === ADD PRODUCT ===
  if (variant === "addProduct") {
    return (
      <button
        onClick={onClick}
        className={clsx(
          "flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors group h-full",
          className
        )}
      >
        {icon || (
          <Plus
            size={size === "small" ? 24 : 28}
            className="text-gray-400 group-hover:text-indigo-500 mb-2"
          />
        )}
        <span
          className={clsx(
            "font-medium text-gray-600 group-hover:text-indigo-600",
            size === "small" ? "text-sm" : "text-sm"
          )}
        >
          {title || "Ürün Ekle"}
        </span>
      </button>
    );
  }

  // === PRODUCT ===

  // Optimize edilmiş kart tasarımı - Düzeltilmiş Tükendi banner'ı ile
  // Card.tsx dosyasının içinden ilgili bölüm

// === PRODUCT ===
if (variant === "product") {
  // Görsel yolu: imageUrl öncelikli, yoksa barkod tabanlı fallback
  const primarySrc = getProductImagePath(barcode, imageUrl);

  return (
    <div
      className={clsx(
        // ↓↓↓ h-full sınıfı buradan kaldırıldı ↓↓↓
        "flex flex-col bg-white rounded-lg border overflow-hidden relative",
        // ↑↑↑ h-full sınıfı buradan kaldırıldı ↑↑↑
        !disabled
          ? stock !== undefined && stock < 5
            ? "border-orange-200" // Az kalan stok için turuncu çerçeve
            : "border-gray-200"   // Normal stok için gri çerçeve
          : "border-gray-100",    // Devre dışıysa daha soluk çerçeve
        !disabled && "hover:border-indigo-200", // Üzerine gelince çerçeve rengi
        disabled && "opacity-60",               // Devre dışıysa opaklık
        className
      )}
      // Tıklama olayını sadece kart devre dışı değilse ekle
      onClick={!disabled ? onClick : undefined}
    >
      {/* Ürün Görseli Konteyneri */}
      {/* aspect-square: Kare olmasını sağlar */}
      {/* overflow-hidden: Taşan kısımları gizler (özellikle Tükendi banner'ı için) */}
      {!hideImage && (
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {/* Kategori Etiketi (Opsiyonel) */}
        {category && (
          <div
            className={clsx(
              "absolute top-1 left-1 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm pointer-events-none z-30 max-w-[80%] truncate",
              stock === 0
                ? "bg-red-100 text-red-700"       // Stok yoksa kırmızı
                : "bg-indigo-100 text-indigo-700" // Stok varsa indigo
            )}
            title={category} // Uzun kategoriler için tooltip
          >
            {category}
          </div>
        )}
        {/* Tükendi Banner'ı (Stok 0 ise) */}
        {stock === 0 && (
          <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden pointer-events-none z-10">
            <div className="absolute bottom-[10px] right-[-45px] -rotate-45 bg-red-700 text-white py-1 w-36 text-center">
              <span className="font-bold text-xs tracking-wider">
                TÜKENDİ
              </span>
            </div>
          </div>
        )}
        {/* Az Kaldı Etiketi (Stok 1-4 arası ise) */}
        {stock !== undefined && stock > 0 && stock < 5 && (
          <div className="absolute bottom-0 right-0 m-1 bg-orange-100 text-orange-700 text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm pointer-events-none z-10">
            {stock} adet kaldı
          </div>
        )}

        {/* Placeholder katmanı (her zaman altta) */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* Neden placeholder? Fallback görsel 404 verirse kırık ikon yerine temiz bir ikon gösterelim */}
          <Image size={32} className="text-gray-300" strokeWidth={1} />
        </div>

        {/* Gerçek görsel (varsa ve yüklenebilmişse) */}
        {primarySrc && !imageLoadFailed && (
          <img
            src={primarySrc}
            alt={title || "Ürün görseli"}
            loading="lazy"
            decoding="async"
            draggable={false}
            // object-contain: Şeffaf PNG ve tek ebat ile en güvenli seçenek
            className={clsx(
              "absolute inset-0 w-full h-full",
              objectFit === "contain" ? "object-contain p-2" : "object-cover"
            )}
            // 404 gibi durumlarda kırık img göstermemek için state güncelliyoruz; alttaki placeholder görünür kalır
            onError={() => setImageLoadFailed(true)}
          />
        )}
      </div>
      )}

      {/* Ürün Detayları Bölümü */}
      <div className="p-2 flex flex-col">
        {/* Ürün Adı */}
        {/* truncate: Uzun isimleri ... ile keser */}
        {/* mb-1: Altında küçük bir boşluk bırakır */}
        <div className="text-sm text-gray-600 mb-1" title={title || "İsimsiz Ürün"}>
          {title || "İsimsiz Ürün"}
        </div>

        {/* Fiyat */}
        {/* text-lg: Biraz daha büyük font */}
        {/* font-bold: Kalın yazı */}
        {/* text-indigo-600: Marka rengi */}
        <div className="text-lg font-bold text-indigo-600">
          {price || "₺0,00"}
        </div>
      </div>

      {/* Grup Yönetim Butonları (Opsiyonel) */}
      {/* Sadece onAddToGroup veya onRemoveFromGroup prop'ları varsa görünür */}
      {(onAddToGroup || onRemoveFromGroup) && (
        <div className="absolute top-1 right-1 flex gap-1 z-10">
          {onAddToGroup && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Kartın kendi onClick'ini tetiklemeyi önler
                onAddToGroup();
              }}
              className="bg-white text-indigo-600 p-0.5 rounded shadow-sm border border-gray-200 hover:bg-indigo-50"
              title="Gruba Ekle"
            >
              <Plus size={12} />
            </button>
          )}
          {onRemoveFromGroup && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Kartın kendi onClick'ini tetiklemeyi önler
                onRemoveFromGroup();
              }}
              className="bg-white text-red-500 p-0.5 rounded shadow-sm border border-gray-200 hover:bg-red-50"
              title="Gruptan Çıkar"
            >
              <Minus size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

  // === STAT ===
  if (variant === "stat") {
    return (
      <div
        className={clsx(
          "bg-white rounded-xl p-6 border hover:border-gray-200 transition-colors h-full shadow-sm",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          {icon && (
            <div
              className={clsx("p-2 rounded-lg", {
                "bg-blue-50 text-blue-600": color === "blue",
                "bg-red-50 text-red-600": color === "red",
                "bg-green-50 text-green-600": color === "green",
                "bg-orange-50 text-orange-600": color === "orange",
                "bg-indigo-50 text-indigo-600": color === "indigo",
              })}
            >
              {icon}
            </div>
          )}
          <span className="text-md font-medium text-gray-600">{title}</span>
        </div>

        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-bold text-gray-900">{value}</div>

          {trend !== undefined && (
            <div
              className={clsx(
                "text-sm font-medium",
                trend > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>

        {description && (
          <div className="mt-1 text-sm text-gray-500">{description}</div>
        )}
      </div>
    );
  }

  // === DEFAULT ===
  const baseStyle = clsx(
    "bg-white rounded-xl p-4 transition-all duration-200 h-full",
    {
      "shadow-lg hover:shadow-xl": variant === "shadow",
      "border border-gray-200": variant === "bordered",
      "shadow-sm": variant === "default",
    },
    className
  );

  return (
    <div className={baseStyle}>
      {title && (
        <div className="mb-4 flex items-center gap-2">
          {icon && <div>{icon}</div>}
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
      )}
      {description && <div className="mb-4 text-gray-800">{description}</div>}
      {value && <div className="text-lg font-bold">{value}</div>}
      {children && <div>{children}</div>}
    </div>
  );
};

export default Card;
