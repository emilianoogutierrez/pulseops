import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
export async function hashPassword(password: string): Promise<string> {
    if (password.length < 12)
        throw new Error("Password must contain at least 12 characters");
    const salt = randomBytes(16);
    const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
    const [scheme, saltHex, hashHex] = encoded.split("$");
    if (scheme !== "scrypt" || !saltHex || !hashHex)
        return false;
    const expected = Buffer.from(hashHex, "hex");
    if (expected.length !== KEY_LENGTH)
        return false;
    const actual = (await scrypt(password, Buffer.from(saltHex, "hex"), expected.length)) as Buffer;
    return timingSafeEqual(actual, expected);
}
