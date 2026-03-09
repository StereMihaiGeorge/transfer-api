jest.mock("../../config/db", () => ({ pool: {} }));

import { generateSlug } from "../../services/eventService";

describe("Slug Generation — wedding", () => {
  test("generates basic wedding slug", () => {
    const slug = generateSlug("wedding", { bride_name: "Ana", groom_name: "Ion" }, "2026-10-10");
    expect(slug).toBe("ana-si-ion-2026");
  });

  test("handles Romanian diacritics", () => {
    const slug = generateSlug(
      "wedding",
      { bride_name: "Mărioara", groom_name: "Ștefan" },
      "2026-10-10"
    );
    expect(slug).toBe("marioara-si-stefan-2026");
  });

  test("handles spaces in names", () => {
    const slug = generateSlug(
      "wedding",
      { bride_name: "Ana Maria", groom_name: "Ion Popescu" },
      "2026-10-10"
    );
    expect(slug).toBe("ana-maria-si-ion-popescu-2026");
  });

  test("converts to lowercase", () => {
    const slug = generateSlug(
      "wedding",
      { bride_name: "ELENA", groom_name: "STEFAN" },
      "2026-10-10"
    );
    expect(slug).toBe("elena-si-stefan-2026");
  });
});

describe("Slug Generation — baptism", () => {
  test("generates basic baptism slug", () => {
    const slug = generateSlug("baptism", { child_name: "Maria" }, "2026-10-10");
    expect(slug).toBe("botez-maria-2026");
  });

  test("handles diacritics in child name", () => {
    const slug = generateSlug("baptism", { child_name: "Ștefăniță" }, "2026-10-10");
    expect(slug).toBe("botez-stefanita-2026");
  });
});

describe("Slug Generation — birthday", () => {
  test("generates basic birthday slug", () => {
    const slug = generateSlug("birthday", { person_name: "Stefan" }, "2026-10-10");
    expect(slug).toBe("majorat-stefan-2026");
  });

  test("handles diacritics in person name", () => {
    const slug = generateSlug("birthday", { person_name: "Ioană" }, "2026-10-10");
    expect(slug).toBe("majorat-ioana-2026");
  });
});
