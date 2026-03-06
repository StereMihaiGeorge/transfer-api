import { registerSchema } from "../../schemas/authSchemas";

describe("Auth Validation", () => {
  test("valid registration data passes schema", () => {
    const result = registerSchema.safeParse({
      username: "TestUser",
      email: "test@test.com",
      password: "Password123",
    });
    expect(result.success).toBe(true);
  });

  test("weak password fails schema", () => {
    const result = registerSchema.safeParse({
      username: "TestUser",
      email: "test@test.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  test("invalid email fails schema", () => {
    const result = registerSchema.safeParse({
      username: "TestUser",
      email: "not-an-email",
      password: "Password123",
    });
    expect(result.success).toBe(false);
  });

  test("missing username fails schema", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "Password123",
    });
    expect(result.success).toBe(false);
  });
});
