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
});

