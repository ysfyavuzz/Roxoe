// components/pos/ProductPanel.tsx
import { Plus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList as List, ListChildComponentProps, FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";

import { Product, ProductGroup } from "../../types/product";
import { formatCurrency } from "../../utils/vatUtils";
import ProductGroupTabs from "../ProductGroupTabs";
import Card from "../ui/Card";


interface ProductPanelProps {
  // Product Groups
  productGroups: ProductGroup[];
  activeGroupId: number;
  setActiveGroupId: (id: number) => void;
  onAddGroup: () => void;
  onRenameGroup: (id: number, name: string) => void;
  onDeleteGroup: (id: number) => void;
  
  // Products
  filteredProducts: Product[];
  compactProductView: boolean;
  setCompactProductView: (compact: boolean) => void;
  onProductClick: (product: Product) => void;
  onAddProductToGroup: (groupId: number, productId: number) => void;
  onRemoveProductFromGroup: (groupId: number, productId: number) => void;
  
  // Select Products Modal
  setShowSelectProductsModal: (show: boolean) => void;
}

const ProductPanel: React.FC<ProductPanelProps> = React.memo(({
  productGroups,
  activeGroupId,
  setActiveGroupId,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  filteredProducts,
  compactProductView,
  setCompactProductView,
  onProductClick,
  onAddProductToGroup,
  onRemoveProductFromGroup,
  setShowSelectProductsModal
}) => {
  // Filter products based on active group
  const finalFilteredProducts = useMemo(() => {
    const defaultGroup = productGroups.find((g) => g.isDefault);

    // Varsayılan grupta => filteredProducts'ı olduğu gibi göster
    if (defaultGroup && activeGroupId === defaultGroup.id) {
      return filteredProducts;
    }

    // Diğer gruplarda => o gruba ait productIds'e sahip ürünleri göster
    const group = productGroups.find((g) => g.id === activeGroupId);
    return filteredProducts.filter((p) =>
      (group?.productIds ?? []).includes(p.id)
    );
  }, [filteredProducts, activeGroupId, productGroups]);

  const isDefaultGroup = productGroups.find((g) => g.id === activeGroupId)?.isDefault;

  return (
    <>
      {/* Product Group Tabs */}
      <ProductGroupTabs
        groups={productGroups}
        activeGroupId={activeGroupId}
        onGroupChange={setActiveGroupId}
        onAddGroup={onAddGroup}
        onRenameGroup={onRenameGroup}
        onDeleteGroup={onDeleteGroup}
        viewToggleIcon={
          <button
            onClick={() => setCompactProductView(!compactProductView)}
            className={`p-1.5 rounded-lg ${
              compactProductView
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            title={compactProductView ? "Kart Görünümü" : "Liste Görünümü"}
          >
            {compactProductView ? (
              // Grid ikonu
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            ) : (
              // Liste ikonu
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            )}
          </button>
        }
      />

      {/* Product Grid/List Container */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* Add to Group Button */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {/* Gruba Ürün Ekle butonu */}
            {activeGroupId !== 0 && !isDefaultGroup && (
              <button
                onClick={() => setShowSelectProductsModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
              >
                <Plus size={16} />
                <span>Gruba Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* Product List/Grid */}
        {compactProductView ? (
          // Liste Görünümü
          <ProductListView
            products={finalFilteredProducts}
            onProductClick={onProductClick}
            isDefaultGroup={isDefaultGroup ?? false}
            activeGroupId={activeGroupId}
            productGroups={productGroups}
            onAddProductToGroup={onAddProductToGroup}
            onRemoveProductFromGroup={onRemoveProductFromGroup}
          />
        ) : finalFilteredProducts.length > GRID_VIRTUALIZATION_THRESHOLD ? (
          // Kart Görünümü - Sanallaştırılmış Grid
          <ProductGridVirtualized
            products={finalFilteredProducts}
            onProductClick={onProductClick}
            isDefaultGroup={isDefaultGroup ?? false}
            activeGroupId={activeGroupId}
            productGroups={productGroups}
            onAddProductToGroup={onAddProductToGroup}
            onRemoveProductFromGroup={onRemoveProductFromGroup}
          />
        ) : (
          // Kart Görünümü - Klasik render (küçük listeler)
          <ProductGridView
            products={finalFilteredProducts}
            onProductClick={onProductClick}
            isDefaultGroup={isDefaultGroup ?? false}
            activeGroupId={activeGroupId}
            productGroups={productGroups}
            onAddProductToGroup={onAddProductToGroup}
            onRemoveProductFromGroup={onRemoveProductFromGroup}
          />
        )}
      </div>
    </>
  );
});

// Product List View Component
const ProductListView: React.FC<{
  products: Product[];
  onProductClick: (product: Product) => void;
  isDefaultGroup?: boolean;
  activeGroupId: number;
  productGroups: ProductGroup[];
  onAddProductToGroup: (groupId: number, productId: number) => void;
  onRemoveProductFromGroup: (groupId: number, productId: number) => void;
}> = ({
  products,
  onProductClick,
  isDefaultGroup,
  activeGroupId,
  productGroups,
  onAddProductToGroup,
  onRemoveProductFromGroup
}) => {
  const ITEM_SIZE = 64; // px
  const THRESHOLD = 100;

  const Row = ({ index, style, data }: ListChildComponentProps<Product[]>) => {
    const product = data[index] as Product;
    return (
      <div
        style={style}
        className={`flex items-center px-3 py-2 hover:bg-indigo-50 transition-colors cursor-pointer ${
          product.stock === 0 ? "opacity-50" : ""
        }`}
        onClick={() => {
          if (product.stock > 0) {
            onProductClick(product);
          }
        }}
        key={product.id}
      >
        {/* Ürün Resmi */}
        <div className="w-12 h-12 flex-shrink-0 mr-3 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div className="flex-1 min-w-0 mr-2">
          <div className="font-medium text-gray-900 truncate">{product.name}</div>
          <div className="text-xs text-gray-500 flex items-center">
            {product.category && (
              <span className="inline-flex items-center gap-1 mr-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                {product.category}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-0.5 ${
                product.stock === 0
                  ? "text-red-500"
                  : product.stock < 5
                  ? "text-orange-500"
                  : "text-gray-500"
              }`}
            >
              <span>Stok: {product.stock}</span>
              {product.stock < 5 && product.stock > 0 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              )}
            </span>
          </div>
        </div>

        {/* Fiyat */}
        <div className="flex flex-col items-end mr-3">
          <div className="text-indigo-600 font-medium">
            {formatCurrency(product.priceWithVat)}
          </div>
        </div>

        {/* Sepete Ekle Butonu */}
        <button
          className={`p-1.5 rounded-full ${
            product.stock > 0
              ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          disabled={product.stock === 0}
          onClick={(e) => {
            e.stopPropagation();
            if (product.stock > 0) {
              onProductClick(product);
            }
          }}
          title={product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
        >
          <Plus size={16} />
        </button>

        {/* Grup İşlemleri */}
        {!isDefaultGroup && (
          <div className="ml-2">
            {!productGroups
              .find((g) => g.id === activeGroupId)
              ?.productIds?.includes(product.id) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddProductToGroup(activeGroupId, product.id);
                }}
                className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                title="Gruba Ekle"
              >
                <Plus size={16} />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProductFromGroup(activeGroupId, product.id);
                }}
                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                title="Gruptan Çıkar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                  <path d="M8 12h8" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {products.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>Ürün bulunamadı</p>
        </div>
      ) : products.length > THRESHOLD ? (
        <List
          height={Math.min(600, products.length * ITEM_SIZE)}
          itemCount={products.length}
          itemSize={ITEM_SIZE}
          width={"100%"}
          className="divide-y"
          itemData={products}
        >
          {Row}
        </List>
      ) : (
        <div className="divide-y">
          {products.map((_, idx) => (
            // Row bileşenini aynı görünümle kullanıyoruz
            <Row key={(products[idx] as Product).id} index={idx} style={{}} data={products} />
          ))}
        </div>
      )}
    </div>
  );
};

// Product Grid View Component (Küçük liste için klasik render)
const ProductGridView: React.FC<{
  products: Product[];
  onProductClick: (product: Product) => void;
  isDefaultGroup?: boolean;
  activeGroupId: number;
  productGroups: ProductGroup[];
  onAddProductToGroup: (groupId: number, productId: number) => void;
  onRemoveProductFromGroup: (groupId: number, productId: number) => void;
}> = ({
  products,
  onProductClick,
  isDefaultGroup,
  activeGroupId,
  productGroups,
  onAddProductToGroup,
  onRemoveProductFromGroup
}) => (
  <div className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
    {products.map((product) => (
      <Card
        key={product.id}
        variant="product"
        title={product.name}
        {...(product.imageUrl && { imageUrl: product.imageUrl })}
        category={product.category}
        price={formatCurrency(product.priceWithVat)}
        stock={product.stock}
        onClick={() => {
          if (product.stock > 0) {
            onProductClick(product);
          }
        }}
        disabled={product.stock === 0}
        {...(
          !isDefaultGroup &&
          !productGroups
            .find((g) => g.id === activeGroupId)
            ?.productIds?.includes(product.id) &&
          { onAddToGroup: () => onAddProductToGroup(activeGroupId, product.id) }
        )}
        {...(
          !isDefaultGroup &&
          productGroups
            .find((g) => g.id === activeGroupId)
            ?.productIds?.includes(product.id) &&
          { onRemoveFromGroup: () => onRemoveProductFromGroup(activeGroupId, product.id) }
        )}
        size="small"
      />
    ))}
  </div>
);

// Basit ölçüm kancası (ResizeObserver ile)
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) {return;}
    const el = ref.current;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
      }
    });
    obs.observe(el);
    // İlk değer
    const rect = el.getBoundingClientRect();
    setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    return () => obs.disconnect();
  }, []);

  return { ref, size } as const;
}

// Grid sanallaştırma sabitleri
const GRID_ITEM_WIDTH = 180;
const GRID_ITEM_HEIGHT = 230; // image + texts + paddings
const GRID_VIRTUALIZATION_THRESHOLD = 100;

// Product Grid Virtualized (Büyük liste için FixedSizeGrid)
const ProductGridVirtualized: React.FC<{
  products: Product[];
  onProductClick: (product: Product) => void;
  isDefaultGroup?: boolean;
  activeGroupId: number;
  productGroups: ProductGroup[];
  onAddProductToGroup: (groupId: number, productId: number) => void;
  onRemoveProductFromGroup: (groupId: number, productId: number) => void;
}> = ({
  products,
  onProductClick,
  isDefaultGroup,
  activeGroupId,
  productGroups,
  onAddProductToGroup,
  onRemoveProductFromGroup,
}) => {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const width = Math.max(0, size.width);
  const height = Math.max(200, size.height); // en az 200px

  const columnCount = Math.max(1, Math.floor(width / GRID_ITEM_WIDTH));
  const rowCount = Math.ceil(products.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= products.length) {return null;}
    const product = products[index] as Product;

    const inGroup = !!productGroups
      .find((g) => g.id === activeGroupId)
      ?.productIds?.includes(product.id);

    return (
      <div style={style} className="p-1">
        <div
          className="rounded-lg border bg-white overflow-hidden flex flex-col"
          style={{ width: GRID_ITEM_WIDTH - 8, height: GRID_ITEM_HEIGHT - 8 }}
        >
          {/* Görsel */}
          <div className="w-full h-[110px] bg-gray-50 overflow-hidden border-b">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
          {/* Metinler */}
          <div className="p-2 flex-1 min-h-0">
            <div className="text-sm font-medium truncate" title={product.name}>
              {product.name}
            </div>
            {product.category && (
              <div className="text-xs text-gray-500 truncate" title={product.category}>
                {product.category}
              </div>
            )}
            <div className="text-indigo-600 font-semibold mt-1">
              {formatCurrency(product.priceWithVat)}
            </div>
          </div>
          {/* Alt aksiyonlar */}
          <div className="px-2 py-1 flex items-center justify-between border-t">
            <button
              className={`text-xs px-2 py-1 rounded ${
                product.stock > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              disabled={product.stock === 0}
              onClick={() => product.stock > 0 && onProductClick(product)}
              title={product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
            >
              Ekle
            </button>
            {!isDefaultGroup && (
              !inGroup ? (
                <button
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Gruba Ekle"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddProductToGroup(activeGroupId, product.id);
                  }}
                >
                  <Plus size={16} />
                </button>
              ) : (
                <button
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title="Gruptan Çıkar"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProductFromGroup(activeGroupId, product.id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                    <path d="M8 12h8" />
                  </svg>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  if (width === 0) {
    // Ölçüm gelene kadar boş bir alan döndür
    return <div ref={ref} className="h-full w-full" />;
  }

  return (
    <div ref={ref} className="h-full w-full">
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        columnWidth={GRID_ITEM_WIDTH}
        rowHeight={GRID_ITEM_HEIGHT}
        width={width}
        height={height}
        overscanRowCount={1}
        overscanColumnCount={1}
        itemKey={({ rowIndex, columnIndex }) => {
          const idx = rowIndex * columnCount + columnIndex;
          return products[idx]?.id ?? `empty-${rowIndex}-${columnIndex}`;
        }}
      >
        {Cell}
      </Grid>
    </div>
  );
};

ProductPanel.displayName = "ProductPanel";

export default ProductPanel;
