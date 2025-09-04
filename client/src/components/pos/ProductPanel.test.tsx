import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import ProductPanel from "./ProductPanel";
import { Product, ProductGroup } from "../../types/product";

function makeProduct(id: number, name: string, stock: number, barcode: string): Product {
  return {
    id,
    name,
    purchasePrice: 0,
    salePrice: 0,
    vatRate: 20,
    priceWithVat: 0,
    category: "Test",
    stock,
    barcode,
  };
}

describe("ProductPanel - List view (compact)", () => {
  beforeEach(() => vi.restoreAllMocks());

  const defaultGroup: ProductGroup = { id: 1, name: "Tümü", order: 0, isDefault: true };

  it("renders product images when showProductImages=true and none when false", () => {
    const products: Product[] = [
      makeProduct(1, "Kalem", 10, "ABC123"),
      makeProduct(2, "Silgi", 0, "XYZ999"),
    ];

    const baseProps = {
      productGroups: [defaultGroup],
      activeGroupId: 1,
      setActiveGroupId: vi.fn(),
      onAddGroup: vi.fn(),
      onRenameGroup: vi.fn(),
      onDeleteGroup: vi.fn(),
      filteredProducts: products,
      compactProductView: true,
      setCompactProductView: vi.fn(),
      onProductClick: vi.fn(),
      onAddProductToGroup: vi.fn(),
      onRemoveProductFromGroup: vi.fn(),
      setShowSelectProductsModal: vi.fn(),
    };

    const { rerender } = render(
      <ProductPanel {...baseProps} showProductImages={true} setShowProductImages={vi.fn()} />
    );

    // Two products => two images expected (barcode fallback)
    expect(screen.getAllByRole("img").length).toBe(2);

    rerender(
      <ProductPanel {...baseProps} showProductImages={false} setShowProductImages={vi.fn()} />
    );

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("calls onProductClick only for items with stock > 0", () => {
    const products: Product[] = [
      makeProduct(1, "Kalem", 10, "ABC123"),
      makeProduct(2, "Silgi", 0, "XYZ999"),
    ];

    const onProductClick = vi.fn();

    render(
      <ProductPanel
        productGroups={[defaultGroup]}
        activeGroupId={1}
        setActiveGroupId={vi.fn()}
        onAddGroup={vi.fn()}
        onRenameGroup={vi.fn()}
        onDeleteGroup={vi.fn()}
        filteredProducts={products}
        compactProductView={true}
        setCompactProductView={vi.fn()}
        onProductClick={onProductClick}
        onAddProductToGroup={vi.fn()}
        onRemoveProductFromGroup={vi.fn()}
        setShowSelectProductsModal={vi.fn()}
        showProductImages={true}
        setShowProductImages={vi.fn()}
      />
    );

    // Click the first row (Kalem) => should call
    fireEvent.click(screen.getByText("Kalem"));
    // Click the second row (Silgi) => should not call
    fireEvent.click(screen.getByText("Silgi"));

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(products[0]);
  });
});

