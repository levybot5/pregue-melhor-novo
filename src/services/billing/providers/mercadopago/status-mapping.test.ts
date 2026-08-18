import { describe, expect, it } from "vitest";
import { mapPreapprovalStatus } from "./status-mapping";

describe("mapPreapprovalStatus", () => {
  const fixtures: Array<[input: string | undefined | null, expected: string]> = [
    ["authorized", "active"],
    ["paused", "inactive"],
    ["cancelled", "cancelled"],
    ["pending", "inactive"],
    [undefined, "inactive"],
    [null, "inactive"],
    ["algum_status_novo_e_desconhecido", "inactive"],
  ];

  it.each(fixtures)("mapeia %j para %j", (input, expected) => {
    expect(mapPreapprovalStatus(input)).toBe(expected);
  });
});
