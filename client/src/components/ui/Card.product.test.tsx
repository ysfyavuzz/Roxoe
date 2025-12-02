import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import Card from "./Card";

describe("Card (product variant)", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("renders image using imageUrl when provided", () => {
    render(
      <Card variant="product" title="Demo" imageUrl="/img.png" price="₺10" />
    );
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/img.png");
    expect(screen.getByText("₺10")).toBeInTheDocument();
  });

  it("renders barcode fallback image when imageUrl missing", () => {
    render(
      <Card variant="product" title="Sigara" barcode="WSK-070" />
    );
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/images/products/wsk-070.png");
  });

  it("respects hideImage by not rendering any <img>", () => {
    render(
      <Card variant="product" title="Hidden" hideImage barcode="ANY" imageUrl="/should-not-render.png" />
    );
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders group action buttons and triggers callbacks", () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(
      <Card
        variant="product"
        title="Groupable"
        onAddToGroup={onAdd}
        onRemoveFromGroup={onRemove}
      />
    );
    const addBtn = screen.getByTitle("Gruba Ekle");
    fireEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledTimes(1);

    const removeBtn = screen.getByTitle("Gruptan Çıkar");
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("hides image on load error and shows placeholder", () => {
    render(
      <Card variant="product" title="Test" imageUrl="/invalid.png" />
    );
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img).toBeInTheDocument();

    // Trigger image load error
    fireEvent.error(img);

    // Image should be hidden after error
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("resets image load error when imageUrl changes", () => {
    const { rerender } = render(
      <Card variant="product" title="Test" imageUrl="/invalid.png" />
    );
    const img = screen.getByRole("img") as HTMLImageElement;

    // Trigger error on first image
    fireEvent.error(img);
    expect(screen.queryByRole("img")).toBeNull();

    // Change imageUrl - should show image again
    rerender(
      <Card variant="product" title="Test" imageUrl="/valid.png" />
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("resets image load error when barcode changes", () => {
    const { rerender } = render(
      <Card variant="product" title="Test" barcode="ABC-123" />
    );
    const img = screen.getByRole("img") as HTMLImageElement;

    // Trigger error
    fireEvent.error(img);
    expect(screen.queryByRole("img")).toBeNull();

    // Change barcode - should show image again
    rerender(
      <Card variant="product" title="Test" barcode="XYZ-789" />
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});

