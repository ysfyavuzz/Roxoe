import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import NeonProductCard from "./NeonProductCard";

describe("NeonProductCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders no <img> when neither imageUrl nor barcode provided (placeholder only)", () => {
    render(<NeonProductCard title="Demo" />);
    const img = screen.queryByRole("img");
    expect(img).toBeNull();
    // Placeholder text is part of the UI layer
    expect(screen.getByText("Resim Yok")).toBeInTheDocument();
  });

  it("uses imageUrl when provided", () => {
    render(<NeonProductCard title="Demo" imageUrl="/custom/img.png" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/custom/img.png");
  });

  it("falls back to barcode-based image when imageUrl missing", () => {
    render(<NeonProductCard title="Kalem" barcode="ABC-123" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/images/products/abc-123.png");
  });

  it("hides broken image on error (keeps placeholder)", () => {
    render(<NeonProductCard title="Broken" imageUrl="/404.png" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    fireEvent.error(img);
    expect((img as HTMLImageElement).style.display).toBe("none");
    expect(screen.getByText("Resim Yok")).toBeInTheDocument();
  });

  it("respects onClick and disabled", () => {
    const onClick = vi.fn();
    const { rerender, container } = render(
      <NeonProductCard title="Clickable" onClick={onClick} />
    );
    const btn = container.querySelector("button")!;
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    onClick.mockClear();
    rerender(<NeonProductCard title="Disabled" onClick={onClick} disabled />);
    const btn2 = container.querySelector("button")!;
    fireEvent.click(btn2);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows category label and stock indicator", () => {
    render(
      <NeonProductCard title="Prod" category="İçecek" stock={3} />
    );
    expect(screen.getByText("İçecek")).toBeInTheDocument();
    // stock tooltip
    const indicator = screen.getByTitle("Stok: 3");
    expect(indicator).toBeInTheDocument();
  });
});

