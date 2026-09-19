import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/server/auth/password";
describe("password hashing", () => {
    it("stores a salted one-way representation and verifies the original", async () => {
        const encoded = await hashPassword("a-secure-demo-password");
        expect(encoded).toMatch(/^scrypt\$/);
        expect(encoded).not.toContain("a-secure-demo-password");
        await expect(verifyPassword("a-secure-demo-password", encoded)).resolves.toBe(true);
        await expect(verifyPassword("wrong-password", encoded)).resolves.toBe(false);
    });
    it("rejects undersized passwords", async () => {
        await expect(hashPassword("short")).rejects.toThrow(/12 characters/);
    });
});
