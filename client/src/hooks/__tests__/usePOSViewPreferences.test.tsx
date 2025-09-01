import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";

import { usePOSViewPreferences } from "../usePOSViewPreferences";

function createMockLocalStorage() {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => store.delete(key),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
  } as Storage;
}

function TestComponent() {
  const { showProductImages, setShowProductImages } = usePOSViewPreferences();
  return (
    <div>
      <span data-testid="spi">{String(showProductImages)}</span>
      <button onClick={() => setShowProductImages(!showProductImages)}>toggle</button>
    </div>
  );
}

describe("usePOSViewPreferences", () => {
  beforeEach(() => {
    // Isolate storage per test to avoid cross-file race conditions
    vi.stubGlobal("localStorage", createMockLocalStorage());
    localStorage.clear();
    cleanup();
  });

  it("defaults to true for showProductImages when not set", () => {
    render(<TestComponent />);
    expect(screen.getByTestId("spi").textContent).toBe("true");
  });

  it("persists showProductImages to localStorage (and rehydrates on remount)", () => {
    const { unmount } = render(<TestComponent />);
    // default true -> toggle to false
    fireEvent.click(screen.getByText("toggle"));

    // Unmount and mount again, it should rehydrate as false
    unmount();
    render(<TestComponent />);
    expect(screen.getByTestId("spi").textContent).toBe("false");
  });
});
