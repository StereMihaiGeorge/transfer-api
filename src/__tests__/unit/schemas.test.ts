import { createGuestSchema } from "../../schemas/guestSchema";
import { createTodoSchema } from "../../schemas/todoSchema";
import { createSongRequestSchema } from "../../schemas/songSchema";

describe("Guest Schema", () => {
  test("valid guest passes", () => {
    const result = createGuestSchema.safeParse({
      name: "Ion Popescu",
      email: "ion@test.com",
      side: "groom",
    });
    expect(result.success).toBe(true);
  });

  test("invalid side fails", () => {
    const result = createGuestSchema.safeParse({
      name: "Ion Popescu",
      side: "invalid",
    });
    expect(result.success).toBe(false);
  });

  test("name too short fails", () => {
    const result = createGuestSchema.safeParse({
      name: "I",
      side: "bride",
    });
    expect(result.success).toBe(false);
  });

  test("member_count exceeds max fails", () => {
    const result = createGuestSchema.safeParse({
      name: "Familia Popescu",
      side: "both",
      member_count: 25,
    });
    expect(result.success).toBe(false);
  });
});

describe("Todo Schema", () => {
  test("valid todo passes", () => {
    const result = createTodoSchema.safeParse({
      title: "Book venue",
      category: "venue",
    });
    expect(result.success).toBe(true);
  });

  test("invalid category fails", () => {
    const result = createTodoSchema.safeParse({
      title: "Book venue",
      category: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("Song Schema", () => {
  test("valid song request passes", () => {
    const result = createSongRequestSchema.safeParse({
      song_title: "Dragostea Din Tei",
      artist: "O-Zone",
      genre: "pop",
    });
    expect(result.success).toBe(true);
  });

  test("invalid genre fails", () => {
    const result = createSongRequestSchema.safeParse({
      song_title: "Test Song",
      genre: "invalid",
    });
    expect(result.success).toBe(false);
  });

  test("populara genre passes", () => {
    const result = createSongRequestSchema.safeParse({
      song_title: "La multi ani",
      genre: "populara",
    });
    expect(result.success).toBe(true);
  });
});
