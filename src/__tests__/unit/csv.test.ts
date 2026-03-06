jest.mock("../../config/db", () => ({ pool: {} }));

import { buildCSV } from "../../services/songService";

describe("CSV Export", () => {
  test("CSV contains special moments section", () => {
    const csv = buildCSV(
      [{ moment: "Intrare miri", song_title: "Perfect", artist: "Ed Sheeran", notes: "" }],
      [],
      []
    );
    expect(csv).toContain("=== MOMENTE SPECIALE ===");
    expect(csv).toContain("Perfect");
    expect(csv).toContain("Ed Sheeran");
  });

  test("CSV contains guest requests section", () => {
    const csv = buildCSV(
      [],
      [{ song_title: "Dragostea Din Tei", artist: "O-Zone", genre: "pop" }],
      []
    );
    expect(csv).toContain("=== SUGESTII INVITATI ===");
    expect(csv).toContain("Dragostea Din Tei");
  });

  test("CSV contains genre summary section", () => {
    const csv = buildCSV([], [], [{ genre: "pop", count: 5 }]);
    expect(csv).toContain("=== SUMAR GENURI ===");
    expect(csv).toContain("pop");
    expect(csv).toContain("5");
  });
});
