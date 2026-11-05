/**
 * Creates (or with --reset, re-passwords) an admin account. There is no public
 * registration: this script is the only way to create admins.
 *
 *   ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:create
 *   npm run admin:create -- --reset   # change password and sign out all sessions
 *   npm run admin:create -- --staff   # create a staff (non-owner) account
 */
import { connectDB, disconnectDB } from "../src/lib/db";
import { hashPassword, passwordProblems } from "../src/lib/auth/password";
import { AdminUser } from "../src/lib/models/AdminUser";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Owner";
  const reset = process.argv.includes("--reset");
  const role = process.argv.includes("--staff") ? "staff" : "owner";

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email");
  const problem = passwordProblems(password);
  if (problem) throw new Error(problem);

  await connectDB();
  await AdminUser.syncIndexes();
  const existing = await AdminUser.findOne({ email });
  const passwordHash = await hashPassword(password);

  if (existing && !reset) throw new Error(`${email} already exists. Use --reset to change its password.`);
  if (existing) {
    await AdminUser.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, active: true, failedAttempts: 0 }, $unset: { lockedUntil: 1 }, $inc: { sessionVersion: 1 } },
    );
    console.log(`✓ Password reset for ${email}. Existing sessions were signed out.`);
  } else {
    await AdminUser.create({ email, name, passwordHash, role });
    console.log(`✓ Created ${role} account ${email}. Sign in at /admin/login.`);
  }
  console.log("  Remove ADMIN_PASSWORD from your env file now.");
  await disconnectDB();
}

main().catch(async (err) => {
  console.error("✗", err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
