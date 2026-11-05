import bcrypt from "bcryptjs";

const COST = 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

let dummy: Promise<string> | null = null;
/** A real hash (computed once) compared against when the email does not exist, to equalise timing. */
export function dummyHash() {
  dummy ??= bcrypt.hash("mr-imperial-timing-equaliser", COST);
  return dummy;
}

export function passwordProblems(plain: string): string | null {
  if (plain.length < 12) return "Password must be at least 12 characters.";
  if (!/[a-z]/i.test(plain) || !/\d/.test(plain)) return "Password must contain letters and numbers.";
  return null;
}
