import mongoose from "mongoose";
import bcrypt from "bcryptjs";

process.loadEnvFile(".env.local");

const ADMIN_EMAIL = "admin@bidkart.com";
const ADMIN_PASSWORD = "Admin@123456";
const ADMIN_NAME = "BidKart Admin";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env.local");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const users = db.collection("users");

  const existing = await users.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    await users.updateOne({ email: ADMIN_EMAIL }, { $set: { role: "admin" } });
    console.log(`✓ Updated existing user "${ADMIN_EMAIL}" to admin`);
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await users.insertOne({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hash,
      role: "admin",
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✓ Created admin user`);
  }

  console.log(`\nAdmin credentials:\n  Email:    ${ADMIN_EMAIL}\n  Password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
