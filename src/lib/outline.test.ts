import { describe, expect, it } from "vitest";
import { normalizeOutlinePointTitle } from "./outline";

describe("normalizeOutlinePointTitle", () => {
  const fixtures: Array<[input: string, expected: string]> = [
    ["1. Providência", "Providência"],
    ["1 - Providência", "Providência"],
    ["1) Providência", "Providência"],
    ["1-Providência", "Providência"],
    ["  2.   Presença", "Presença"],
    ["10. Proteção e Honra", "Proteção e Honra"],
    ["Providência do Pastor", "Providência do Pastor"],
  ];

  it.each(fixtures)("normaliza %j para %j", (input, expected) => {
    expect(normalizeOutlinePointTitle(input)).toBe(expected);
  });
});
