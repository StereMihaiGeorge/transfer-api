jest.mock("../../config/db", () => ({ pool: {} }));

import { generateSlug } from "../../services/eventService";

describe("Slug Generation", () => {
  test("generates basic slug", () => {
    const slug = generateSlug("Ana", "Ion", "2026-10-10");
    expect(slug).toBe("ana-si-ion-2026");
  });

  test("handles Romanian diacritics", () => {
    const slug = generateSlug("Mărioara", "Ștefan", "2026-10-10");
    expect(slug).toBe("marioara-si-stefan-2026");
  });

  test("handles spaces in names", () => {
    const slug = generateSlug("Ana Maria", "Ion Popescu", "2026-10-10");
    expect(slug).toBe("ana-maria-si-ion-popescu-2026");
  });

  test("converts to lowercase", () => {
    const slug = generateSlug("ELENA", "STEFAN", "2026-10-10");
    expect(slug).toBe("elena-si-stefan-2026");
  });
});
