import "dotenv/config";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  tablesFilter: [
    "ble_device",
    "post",
    "user",
    "account",
    "session",
    "verification",
  ],
} as any;
