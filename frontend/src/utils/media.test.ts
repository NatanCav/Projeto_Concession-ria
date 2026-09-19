import { describe, expect, it } from "vitest";
import { resolveMediaUrl } from "./media";

describe("resolveMediaUrl", () => {
  it("prefixes a root-relative path with the API origin", () => {
    expect(resolveMediaUrl("/uploads/vehicles/1/a.png")).toBe("http://localhost:8080/uploads/vehicles/1/a.png");
  });

  it("leaves an already-absolute http(s) URL untouched", () => {
    expect(resolveMediaUrl("https://cdn.example.com/logo.png")).toBe("https://cdn.example.com/logo.png");
    expect(resolveMediaUrl("http://cdn.example.com/logo.png")).toBe("http://cdn.example.com/logo.png");
  });

  it("returns null/undefined unchanged", () => {
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl(undefined)).toBeUndefined();
  });

  it("adds a leading slash when the backend path is missing one", () => {
    expect(resolveMediaUrl("uploads/logo.png")).toBe("http://localhost:8080/uploads/logo.png");
  });
});
